const Butter = require('./butter')

const server = new Butter();

const PORT = 8000;

const SESSIONS = [];

const USERS = [
    {id: 1, name: "Don Williams", username: "don23", password: "string"},
    {id: 2, name: "Robert Green", username: "robertsky", password: "string"},
    {id: 3, name: "Ben Adams", username: "benpoet", password: "string"}
];

const POSTS = [
    {
        id: 1,
        body: 'This is a sample post. Real posts will load from your backend!',
        userID: 1,
    }
]

server.route("get", "/login", (req,res)=>{
    res.sendFile('public/html/login.html', 'text/html');
})
server.route("get", "/styles/login.css", (req,res)=>{
    res.sendFile('public/styles/login.css', 'text/css');
})
server.route("get", "/scripts/login.js", (req,res)=>{
    res.sendFile('public/scripts/login.js', 'text/javascript');
})
server.route("get", "/main", (req,res)=>{
    res.sendFile('public/html/main.html', 'text/html');
})
server.route("get", "/styles/main.css", (req,res)=>{
    res.sendFile('public/styles/main.css', 'text/css');
})
server.route("get", "/scripts/posts.js", (req,res)=>{
    res.sendFile('public/scripts/posts.js', 'text/javascript');
})
// API Endpoints

server.route('post', '/api/login', (req,res)=>{
    let body = '';
    req.on('data', (chunk)=>{
        body += chunk.toString('utf-8');
    })
    req.on('end', ()=>{
        body = JSON.parse(body)
       

        const user = USERS.find((user)=>user.username === body.username && user.password === body.password);
        
        if(user){
            const token = Math.floor(Math.random() * 1000000).toString()
            SESSIONS.push({userId: user.id, token})
            console.log(SESSIONS)
            res.setHeader("Set-Cookie", `token=${token}; path=/; HttpOnly`)
            res.status(200).json({message: "Login Succesful", username: user.username})
        } else{
            return res.status(401).json({error: "Invalid userame or password"})
    }
    })
})

server.route('post', '/api/posts', (req, res)=>{
    let body = '';
    req.on('data', (chunk)=>{
        body += chunk.toString('utf-8')
    })
    req.on('end', ()=>{
        body = JSON.parse(body);

        const cookies = req.headers.cookie;
        if(!cookies || !cookies.includes('token=')){
            return res.status(401).json({error: "Unauthorized"})
        }

        const token = cookies.split('=')[1]
        if (!token) {
                return res.status(401).json({error: "No token found"});
            }
        const session = SESSIONS.find((session)=>session.token === token);
        if(session){
            const user = USERS.find((user)=>user.id === session.userId);
            const newPost = {
                id: POSTS.length + 1,
                body: body.body,
                userID: user.id,
                timestamp: new Date().toISOString(),
            }
            POSTS.push(newPost);
            res.status(201).json({...newPost, username: user ? user.username : 'Unknown User'});
        } else{
            return res.status(401).json({error: "Unauthorized"})
        }
    })
})

// Add this to your server.js
server.route('get', '/api/posts', (req, res) => {
    try {
        // Add username to each post
        const postsWithUsernames = POSTS.map(post => {
            const user = USERS.find(u => u.id === post.userID);
            return {
                ...post,
                username: user ? user.name : 'Unknown User'
            };
        });
        
        res.status(200).json(postsWithUsernames);
    } catch (error) {
        res.status(500).json({error: "Failed to load posts"});
    }
});


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});