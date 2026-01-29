import './MobileActivityHeader.css'

const MobileActivityHeader = ({ onBack }) => {
  return (
    <header className="mobile-activity-header">
      <button onClick={onBack} className="mobile-back-btn" aria-label="Back">
        ←
      </button>
      <div className="mobile-header-content">
        <h1>Activity History</h1>
        <p>Track all product operations</p>
      </div>
    </header>
  )
}

export default MobileActivityHeader

