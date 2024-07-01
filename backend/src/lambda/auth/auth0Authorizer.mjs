import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-qnt0bslcmf2fftec.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  if (!jwt) {
    throw new Error('Invalid token')
  }

  const kid = jwt.header.kid
  const jwks = await Axios.get(jwksUrl)
  const signingKeys = jwks.data.keys.filter(key => key.kid === kid)

  if (!signingKeys.length) {
    throw new Error('Invalid signing keys')
  }

  const signingKey = signingKeys[0]
  const publicKey = signingKey.x5c[0]
  const cert = `-----BEGIN CERTIFICATE-----\n${publicKey}\n-----END CERTIFICATE-----`

  try {
    const verifiedToken = jsonwebtoken.verify(token, cert, { algorithms: ['RS256'] })
    return verifiedToken
  } catch (e) {
    throw new Error('Token verification failed')
  }
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
