/**
 * Omni Claw — Search Module
 * Advanced web search with Perplexity
 */

const https = require('https');

class OmniSearch {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'api.perplexity.ai';
  }

  /**
   * Quick web search (Sonar)
   */
  async search(query, options = {}) {
    const webSearchOptions = {
      search_context_size: options.contextSize || 'medium'
    };

    if (options.domain) webSearchOptions.search_domain_filter = Array.isArray(options.domain) ? options.domain : [options.domain];
    if (options.since) webSearchOptions.search_recency_filter = options.since;
    if (options.language) webSearchOptions.language_preference = options.language;

    return this._sonarCall({
      model: 'sonar',
      messages: [{ role: 'user', content: query }],
      web_search_options: webSearchOptions
    });
  }

  /**
   * Raw search results (Search API — no AI processing)
   */
  async rawSearch(queries) {
    const queryArray = Array.isArray(queries) ? queries : [queries];
    return this._searchCall({ query: queryArray });
  }

  /**
   * Image search
   */
  async imageSearch(query, options = {}) {
    return this._sonarCall({
      model: 'sonar',
      messages: [{ role: 'user', content: query }],
      return_images: true,
      image_domain_filter: options.domains || undefined,
      image_format_filter: options.formats || undefined
    });
  }

  /**
   * SEC filings search
   */
  async secSearch(query) {
    return this._sonarCall({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: query }],
      search_domain: 'sec',
      web_search_options: { search_context_size: 'high' }
    });
  }

  /**
   * Sonar API call
   */
  _sonarCall(body) {
    return this._request('/v1/sonar', body);
  }

  /**
   * Search API call
   */
  _searchCall(body) {
    return this._request('/search', body);
  }

  /**
   * Generic HTTP request
   */
  _request(endpoint, body) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
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
              results: response.results || response.search_results || [],
              images: response.images || [],
              videos: response.videos || [],
              cost: response.usage?.cost || {},
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

module.exports = OmniSearch;
