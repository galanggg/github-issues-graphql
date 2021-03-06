import React from 'react'
import Repository from './Repository'

const Organization = ({organization, errors, onFetchMoreIssues, onStarRepository}) => {
  if (errors) {
    return (
      <p>error</p>
    )
  }

  return (
  <div>
    <p>
      <strong>Issue from Organization : </strong>
      <a href={organization.url}>{organization.name}</a>
    </p>
    <Repository repository={organization.repository} onFetchMoreIssues={onFetchMoreIssues} onStarRepository={onStarRepository} />
  </div>
  )
}

export default Organization