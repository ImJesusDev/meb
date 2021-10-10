# Create kubernetes secret
`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf`
`kubectl create secret generic spaces-key --from-literal=SPACES_KEY=asd`
`kubectl create secret generic spaces-secret --from-literal=SPACES_SECRET=asdasd`
`kubectl create secret generic email-password --from-literal=EMAIL_PASSWORD=asdasd`