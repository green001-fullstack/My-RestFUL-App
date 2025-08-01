const postContent = document.getElementById('post-content');
const postSubmit = document.getElementById('post-submit');
const postsList = document.getElementById('posts-list');
const logoutBtn = document.getElementById('logout-btn');

const loadPosts = async () =>{
    try {
        const response = await fetch('/api/posts');
        if(response.status === 200){
            const posts = await response.json();
            postsList.innerHTML = ''; // Clear existing posts
            posts.forEach((post)=>addPostToDOM(post));
        }else{
            console.error('Failed to load posts');
            const error = await response.json();
            console.error('Error:', error.error);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts');
    }
}

document.addEventListener('DOMContentLoaded', loadPosts);


postSubmit.addEventListener('click', async () =>{
    const content = postContent.value.trim();

    if(!content){
        alert('Please write something in the field')
        return
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ body: content})
        })

        if (response.status === 201){
            const newPost = await response.json(); 
            addPostToDOM(newPost);
            postContent.value = '';
        } else{
            const error = await response.json();
            console.log('Error creating post: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create post');
    }
})

function addPostToDOM(post){
    const postElement = document.createElement('div')
    postElement.className = 'post';
    postElement.dataset.postId = post.id;
    postElement.innerHTML = `
    <div class="post-header">
        <span class="post-author">${post.username}</span>
        <span class="post-date">${formatDate(post.timestamp || new Date().toISOString())}</span>
    </div>
    <div class="post-content">
        <p>${post.body}</p>
    </div>
    <div class="post-actions">
        <button class="edit-post">Edit</button>
        <button class="delete-post">Delete</button>
    </div>`;
    postsList.insertBefore(postElement, postsList.firstChild);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

document.addEventListener('click', async (e)=>{
    if(e.target.id === 'logout-btn'){
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            })
            window.location.href = '/login';
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }
})





// // Load posts when page loads
// document.addEventListener('DOMContentLoaded', loadPosts);

// // Handle post submission
// postSubmit.addEventListener('click', async () => {
//     const content = postContent.value.trim();
    
//     if (!content) {
//         alert('Please write something before posting!');
//         return;
//     }
    
//     try {
//         const response = await fetch('/api/posts', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ body: content })
//         });
        
//         if (response.status === 201) {
//             const newPost = await response.json();
//             addPostToDOM(newPost);
//             postContent.value = ''; // Clear the textarea
//         } else {
//             const error = await response.json();
//             alert('Error creating post: ' + error.error);
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('Failed to create post');
//     }
// });

// // Handle logout
// logoutBtn.addEventListener('click', () => {
//     // Clear any client-side data if needed
//     window.location.href = '/login';
// });

// // Load existing posts
// async function loadPosts() {
//     try {
//         const response = await fetch('/api/posts');
//         if (response.ok) {
//             const posts = await response.json();
//             displayPosts(posts);
//         }
//     } catch (error) {
//         console.error('Error loading posts:', error);
//     }
// }

// // Display posts in the DOM
// function displayPosts(posts) {
//     postsList.innerHTML = ''; // Clear existing posts
//     posts.forEach(post => addPostToDOM(post));
// }

// // Add a single post to the DOM
// function addPostToDOM(post) {
//     const postElement = document.createElement('div');
//     postElement.className = 'post';
//     postElement.innerHTML = `
//         <div class="post-header">
//             <span class="post-author">${post.username || 'Unknown User'}</span>
//             <span class="post-date">${formatDate(post.timestamp || new Date().toISOString())}</span>
//         </div>
//         <div class="post-content">
//             <p>${post.body}</p>
//         </div>
//         <div class="post-actions">
//             <button class="edit-post" onclick="editPost(${post.id})">Edit</button>
//             <button class="delete-post" onclick="deletePost(${post.id})">Delete</button>
//         </div>
//     `;
    
//     // Add the new post at the beginning (most recent first)
//     postsList.insertBefore(postElement, postsList.firstChild);
// }

// // Format timestamp to readable date
// function formatDate(timestamp) {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);
    
//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} minutes ago`;
//     if (diffHours < 24) return `${diffHours} hours ago`;
//     if (diffDays < 7) return `${diffDays} days ago`;
    
//     return date.toLocaleDateString();
// }

// // Placeholder functions for edit and delete
// function editPost(postId) {
//     alert(`Edit post ${postId} - Not implemented yet`);
// }

// function deletePost(postId) {
//     alert(`Delete post ${postId} - Not implemented yet`);
// }