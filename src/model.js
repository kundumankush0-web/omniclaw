/**
 * Omni Claw — Model Gateway Module
 * Multi-provider model access via Perplexity Agent API
 */

const https = require('https');

// Available models
const MODELS = {
  // Perplexity
  'perplexity/sonar': { provider: 'perplexity', input: 0.25, output: 2.50 },
  
  // OpenAI
  'openai/gpt-5.4': { provider: 'openai', input: 2.50, output: 15.00 },
  'openai/gpt-5.2': { provider: 'openai', input: 1.75, output: 14.00 },
  'openai/gpt-5.1': { provider: 'openai', input: 1.25, output: 10.00 },
  'openai/gpt-5-mini': { provider: 'openai', input: 0.25, output: 2.00 },
  
  // Anthropic
  'anthropic/claude-opus-4-6': { provider: 'anthropic', input: 5.00, output: 25.00 },
  'anthropic/claude-sonnet-4-6': { provider: 'anthropic', input: 3.00, output: 15.00 },
  'anthropic/claude-haiku-4-5': { provider: 'anthropic', input: 1.00, output: 5.00 },
  
  // Google
  'google/gemini-3.1-pro-preview': { provider: 'google', input: 2.00, output: 12.00 },
  'google/gemini-3-flash-preview': { provider: 'google', input: 0.50, output: 3.00 },
  
  // xAI
  'xai/grok-4-1-fast-non-reasoning': { provider: 'xai', input: 0.20, output: 0.50 },
  
  // NVIDIA
  'nvidia/nemotron-3-super-120b-a12b': { provider: 'nvidia', input: 0.25, output: 2.50 },
};

class OmniModel {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'api.perplexity.ai';
    this.defaultModel = 'nvidia/nemotron-3-super-120b-a12b';
  }

  /**
   * List available models
   */
  listModels() {
    return Object.entries(MODELS).map(([name, info]) => ({
      name,
      ...info,
      costPer1M: `$${info.input} in / $${info.output} out`
    }));
  }

  /**
   * Generate response with a specific model
   */
  async generate(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    
    const body = {
      model,
      input: prompt,
      max_output_tokens: options.maxTokens || 4096
    };

    // Add tools if requested
    if (options.tools) {
      body.tools = options.tools;
    }

    // Add function definitions
    if (options.functions) {
      body.tools = options.functions.map(fn => ({
        type: 'function',
        ...fn
      }));
    }

    // Add structured output
    if (options.schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          schema: options.schema
        }
      };
    }

    // Model fallback
    if (options.fallback) {
      body.models = [model, ...options.fallback];
    }

    return this._call(body);
  }

  /**
   * Generate with web search
   */
  async generateWithSearch(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    
    return this._call({
      model,
      input: prompt,
      tools: [{ type: 'web_search' }],
      instructions: 'Use web_search for current information.',
      max_output_tokens: options.maxTokens || 4096
    });
  }

  /**
   * Make API call to Perplexity Agent API
   */
  _call(body) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      
      const options = {
        hostname: this.baseUrl,
        path: '/v1/agent',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({
              text: response.output_text || response.choices?.[0]?.message?.content || '',
              model: response.model || body.model,
              cost: response.usage?.cost || {},
              tokens: response.usage?.total_tokens || 0,
              raw: response
            });
          } catch (err) {
            reject(new Error(`Parse error: ${err.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

module.exports = OmniModel;
