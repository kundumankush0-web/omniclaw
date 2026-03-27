/**
 * Omni Claw — Research Module
 * Deep research engine powered by Perplexity
 */

const https = require('https');

class OmniResearch {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'api.perplexity.ai';
  }

  /**
   * Quick search — fast, cheap
   */
  async search(query, options = {}) {
    return this._call({
      model: 'sonar',
      messages: [{ role: 'user', content: query }],
      web_search_options: {
        search_context_size: options.contextSize || 'low',
        ...this._buildFilters(options)
      }
    });
  }

  /**
   * Deep research — comprehensive with citations
   */
  async deepResearch(query, options = {}) {
    return this._call({
      model: 'sonar-deep-research',
      messages: [{ role: 'user', content: query }],
      reasoning_effort: options.effort || 'high',
      web_search_options: this._buildFilters(options)
    });
  }

  /**
   * Pro search — multi-step reasoning
   */
  async proSearch(query, options = {}) {
    return this._call({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: query }],
      stream: true,
      web_search_options: {
        search_type: 'pro',
        search_context_size: options.contextSize || 'medium',
        ...this._buildFilters(options)
      }
    });
  }

  /**
   * Academic research — scholarly sources
   */
  async academicSearch(query, options = {}) {
    return this._call({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: query }],
      search_mode: 'academic',
      web_search_options: {
        search_context_size: options.contextSize || 'high',
        ...this._buildFilters(options)
      }
    });
  }

  /**
   * Reasoning — chain of thought
   */
  async reason(query, options = {}) {
    return this._call({
      model: 'sonar-reasoning-pro',
      messages: [{ role: 'user', content: query }],
      reasoning_effort: options.effort || 'medium',
      web_search_options: {
        search_context_size: options.contextSize || 'medium'
      }
    });
  }

  /**
   * Build search filters from options
   */
  _buildFilters(options) {
    const filters = {};
    
    if (options.domain) {
      filters.search_domain_filter = Array.isArray(options.domain) 
        ? options.domain 
        : [options.domain];
    }
    
    if (options.since) {
      filters.search_recency_filter = options.since;
    }
    
    if (options.afterDate) {
      filters.search_after_date = options.afterDate;
    }
    
    if (options.beforeDate) {
      filters.search_before_date = options.beforeDate;
    }
    
    if (options.language) {
      filters.language_preference = options.language;
    }
    
    return filters;
  }

  /**
   * Make API call to Perplexity
   */
  _call(body) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      
      const options = {
        hostname: this.baseUrl,
        path: '/v1/sonar',
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
              answer: response.choices?.[0]?.message?.content || '',
              sources: response.search_results || [],
              cost: response.usage?.cost || {},
              tokens: response.usage?.total_tokens || 0,
              model: response.model || body.model,
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

module.exports = OmniResearch;
