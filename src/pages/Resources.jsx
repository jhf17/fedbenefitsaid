import React from 'react'
import './Resources.css'

export default function Resources() {
  React.useEffect(() => {
    document.title = 'Resources — FedBenefitsAid'
  }, [])

  return (
    <main className="resources-page">
      <h1>Federal Benefits Resources</h1>
      <section className="resources-grid">
        <article className="resource-card">
          <h3>FESS</h3>
          <p>Federal Employees Retirement System Resources</p>
          <a href="https://fers.ofm.gov/" target="_blank">Visit FERS</a>
        </article>
        <article className="resource-card">
          <h3>OPM</h3>
          <p>Office of Personnel Management</p>
          <a href="https://www.opm.gov/" target="_blank">Visit OPM</a>
        </article>
        <article className="resource-card">
          <h3>SSA</h3>
          <p>Social Security Administration</p>
          <a href="https://www.ssa.gov/" target="_blank">Visit SSA</a>
        </article>
      </section>
    </main>
  )
}
