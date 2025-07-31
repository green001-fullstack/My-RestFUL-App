const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    const response = await fetch('api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
    })
    if (response.status === 200){
        const data = await response.json()
        window.location.href = '/main'
    }
})