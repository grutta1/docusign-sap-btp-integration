/**
 * Server Unit Tests
 * Basic tests for the local development server
 */

const request = require('supertest');
const app = require('../../src/server');

describe('Server', () => {
  describe('GET /', () => {
    it('should return server information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body).toHaveProperty('name', 'DocuSign-SAP BTP Integration');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('mode', 'local-development');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
  
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('services');
      
      // Check services object
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('cache');
      expect(response.body.services).toHaveProperty('docusign');
      expect(response.body.services).toHaveProperty('sapBtp');
    });
  });
  
  describe('GET /api-docs', () => {
    beforeEach(() => {
      process.env.ENABLE_API_DOCS = 'true';
    });
    
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api-docs')
        .expect(200);
      
      expect(response.text).toContain('DocuSign-SAP BTP Integration API');
      expect(response.text).toContain('Local Development Mode');
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });
  
  describe('Mock DocuSign Endpoints', () => {
    beforeEach(() => {
      process.env.MOCK_DOCUSIGN_API = 'true';
    });
    
    describe('GET /api/docusign/templates', () => {
      it('should return mock templates', async () => {
        const response = await request(app)
          .get('/api/docusign/templates')
          .expect(200);
        
        expect(response.body).toHaveProperty('templates');
        expect(Array.isArray(response.body.templates)).toBe(true);
        expect(response.body.templates.length).toBeGreaterThan(0);
        
        const template = response.body.templates[0];
        expect(template).toHaveProperty('templateId');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
      });
    });
    
    describe('POST /api/docusign/envelopes', () => {
      it('should create mock envelope', async () => {
        const envelopeData = {
          emailSubject: 'Test Document',
          recipients: [{
            email: 'test@example.com',
            name: 'Test User'
          }],
          documents: [{
            name: 'test.pdf',
            documentBase64: 'dGVzdCBwZGY='
          }]
        };
        
        const response = await request(app)
          .post('/api/docusign/envelopes')
          .send(envelopeData)
          .expect(201);
        
        expect(response.body).toHaveProperty('envelopeId');
        expect(response.body).toHaveProperty('status', 'sent');
        expect(response.body).toHaveProperty('emailSubject', 'Test Document');
        expect(response.body).toHaveProperty('statusDateTime');
        expect(response.body).toHaveProperty('recipients');
        expect(response.body).toHaveProperty('documents');
      });
      
      it('should handle envelope creation without email subject', async () => {
        const response = await request(app)
          .post('/api/docusign/envelopes')
          .send({})
          .expect(201);
        
        expect(response.body.emailSubject).toBe('Please sign this document');
      });
    });
  });
  
  describe('Mock SAP BTP Endpoints', () => {
    beforeEach(() => {
      process.env.MOCK_SAP_BTP_API = 'true';
    });
    
    describe('GET /api/integration/status', () => {
      it('should return integration status', async () => {
        const response = await request(app)
          .get('/api/integration/status')
          .expect(200);
        
        expect(response.body).toHaveProperty('status', 'running');
        expect(response.body).toHaveProperty('flows');
        expect(Array.isArray(response.body.flows)).toBe(true);
        
        const flow = response.body.flows[0];
        expect(flow).toHaveProperty('name');
        expect(flow).toHaveProperty('status');
        expect(flow).toHaveProperty('lastExecution');
      });
    });
  });
  
  describe('Error Handling', () => {
    describe('GET /nonexistent', () => {
      it('should return 404 for nonexistent routes', async () => {
        const response = await request(app)
          .get('/nonexistent')
          .expect(404);
        
        expect(response.body).toHaveProperty('error', 'Not Found');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('availableRoutes');
        expect(Array.isArray(response.body.availableRoutes)).toBe(true);
      });
    });
    
    it('should handle POST requests to nonexistent routes', async () => {
      const response = await request(app)
        .post('/nonexistent')
        .send({ test: 'data' })
        .expect(404);
      
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toContain('POST /nonexistent');
    });
  });
  
  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin', '*');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
    
    it('should handle OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/test')
        .expect(200);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
  
  describe('Request Logging', () => {
    it('should log requests (captured in console mock)', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await request(app)
        .get('/health')
        .expect(200);
      
      // In test environment, console.log is mocked
      // In real environment, this would log the request
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('JSON Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const testData = { test: 'data', number: 123 };
      
      const response = await request(app)
        .post('/api/docusign/envelopes')
        .send(testData)
        .expect(201);
      
      // The mock endpoint should have received the JSON data
      expect(response.body).toHaveProperty('envelopeId');
    });
    
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/docusign/envelopes')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});
