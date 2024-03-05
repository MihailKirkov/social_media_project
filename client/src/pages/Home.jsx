import React from 'react'
import './home.scss'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='home'>
      <h1>First Page</h1>
      <div className='workspaces'>
        <Link to="/feed">Ants-In</Link>
        <Link to="/feed">Gutes-Set</Link>
      </div>
    </div>
  )
}

export default Home