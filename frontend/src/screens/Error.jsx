export default function Error({ state, set }) {
  return (
    <div className="center">
      <div className="err-icon">⚠</div>
      <div className="err-title">Connection failed</div>
      <div className="err-sub">{state.errorMsg}</div>
      <button
        className="btn btn-primary"
        onClick={() => { history.pushState(null, '', '/'); set({ screen: 'landing' }) }}
      >
        Go home
      </button>
    </div>
  )
}
