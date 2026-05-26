export default function NotFound() {
  return (
    <div className="notfound-wrap">
      <div className="notfound-code">404</div>
      <div className="notfound-body">
        <p className="notfound-line notfound-lead">You look like a traveler.</p>
        <p className="notfound-line">But there are no marks here.</p>
        <p className="notfound-line">No path to follow.</p>
        <p className="notfound-line">No trace to find.</p>
      </div>
      <a className="btn-return" href="/">Return to safety</a>
    </div>
  )
}
