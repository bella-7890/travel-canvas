function ApiKeyPanel({ apiKey, unsplashKey, mode, onClearData }) {
  return (
    <div className="card api-card">
      <div className="section-heading">
        <h2>AI Service Setup</h2>
        <span>{mode === 'live' ? 'Live mode' : 'Demo mode'}</span>
      </div>

      <div className="service-row">
        <div>
          <p className="field-label">OpenAI API Key</p>
          <p className="status-text">{apiKey ? 'Configured via .env' : 'Not configured'}</p>
        </div>

        <div>
          <p className="field-label">Unsplash Access Key</p>
          <p className="status-text">{unsplashKey ? 'Configured via .env' : 'Not configured'}</p>
        </div>
      </div>

      <p className="status-text">
        {mode === 'live'
          ? 'Live AI mode is active. OpenAI and Unsplash will be used for analysis and image search.'
          : 'No keys detected. Create a .env file from .env.example to enable live mode.'}
      </p>

      <button type="button" onClick={onClearData} style={{ marginTop: '12px', background: '#ef4444' }}>
        Clear All Data
      </button>
    </div>
  )
}

export default ApiKeyPanel
