import { authClient } from './auth-client'

const githubButton = document.getElementById('githubsignin')

githubButton.addEventListener('click', async () => {
  const { data, error } = await authClient.signIn.social({
    provider: 'github',
    callbackURL: '/auth/success',
  })
  console.log('THE DATA:')
  console.log(data)
})
