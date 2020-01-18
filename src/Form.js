import React from 'react'
import Organization from './Organization'
import axios from 'axios'

//fetching data dari github menggunakan library axios
const fetchData = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}` //access token dari .env
  }
})

const resolveIssueQuery = queryResult => () => ({
  organization: queryResult.data.data.organization,
  errors: queryResult.data.errors, 
})

const getIssueOfRepo = (path,cursor) => {
  const [organization, repository] = path.split('/')

  return fetchData.post('', {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: {organization, repository, cursor}
  })
}
//fetching data Organization github
const GET_ISSUES_OF_REPOSITORY = `
  query ($organization: String!, $repository: String!, $cursor: String) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        id
        name
        url
        viewerHasStarred
				 issues(first: 5, after: $cursor, states : [OPEN]) {
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
                edges {
                  node {
                    id
                    content
                  }
                }
              }
            }
          }
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

const ADD_STAR = `
  mutation ($repositoryId: ID!) {
    addStar(input:{starrableId:$repositoryId}) {
      starrable {
        viewerHasStarred
      }
    }
  }
`;

const addStarToRepository = repositoryId => {
  return fetchData.post('', {
    query: ADD_STAR,
    variables: {repositoryId}
  })
}

const resolveStarMutation = mutationResult=> state => {
  const {
    viewerHasStarred
  } = mutationResult.data.data.addStar.starrable
  const {totalCount} = state.organization.repository.stargazers

  return {
    ...state,
    organization: {
      ...state.organization, 
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount + 1
        }
      }
    }
  }
}

class Form extends React.Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: '',
    errors: null  
  }

  componentDidMount() {
    this.fetchFromGithub(this.state.path)
  }

  onChange = event => {
    this.setState({path: event.target.value})
    //onChange ini untuk form inputan
  }

  onSubmit = event => {
    this.fetchFromGithub(this.state.path)
    
    event.preventDefault()
    //onSubmit ini untuk tag form
  }
  
  //menggunakan axios untuk request POST method dari inputan
  fetchFromGithub = (path, cursor) => {
    getIssueOfRepo(path, cursor).then(queryResult => 
      this.setState(resolveIssueQuery(queryResult, cursor), console.log(queryResult)))
  }

  onFetchMoreIssues = () => {
    const {
      endCursor
    } = this.state.organization.repository.issues.pageInfo
    this.fetchFromGithub(this.state.path, endCursor)
  }

  onStarRepository = (repositoryId, viewerHasStarred) => {
    addStarToRepository(repositoryId).then(mutationResult => 
    this.setState(resolveStarMutation(mutationResult)))
  }


  render() {
    const {path, organization, errors} = this.state
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">
            Open issue di https://github.com/
          </label>
          <input 
            id="url"
            value={path}
            type="text"
            onChange={this.onChange}
            style={{width: '300px'}}
          />
          <button type="submit">Search</button>
        </form>
        <hr></hr>
        {
        organization ? (
        <Organization organization={organization} errors={errors} onFetchMoreIssues={this.onFetchMoreIssues} onStarRepository={this.onStarRepository} />
        ) : (
          <p>Silahkan masukkan organisasi/repository</p>
        )
        }
      </div>
    )
  }
}

export default Form