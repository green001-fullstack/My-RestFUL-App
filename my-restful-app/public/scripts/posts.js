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
        } else if( response.status === 401 ){
            alert('You must be logged in to create a post');
            window.location.href = '/login';
        }else{
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

    if(e.target.classList.contains('delete-post')){
    const postElement = e.target.closest('.post');
    const postId = postElement.dataset.postId;
    
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.status === 200) {
            postElement.remove();
        } else if (response.status === 404) {
            const error = await response.json();
            alert(`Post not found: ${error.error}`);
            // Optionally refresh the posts list
            loadPosts();
        } else if(response.status === 403){
            alert('You can only delete your own posts');
        }else {
            console.log('Failed to delete post');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete post');
    }
    }

    if(e.target.classList.contains('edit-post')){
        const postElement = e.target.closest('.post');
        const postId = postElement.dataset.postId;
        const contentDiv = postElement.querySelector('.post-content');
        const textArea = document.createElement('textarea');
        const oldTextArea = postElement.querySelector('post-content p');
        textArea.value = oldTextArea?.textContent || '';

        if(oldTextArea){
            oldTextArea.replaceWith(textArea);
        }else{
            contentDiv.innerHTML = '';
            contentDiv.appendChild(textArea);
        }

        e.target.textContent = 'Save';
        e.target.classList.remove('edit-post');
        e.target.classList.add('save-post');

        if(e.target.classList.contains('save-post')){
            const postElement = e.target.closest('.post')
            const postId = postElement.dataset.postId;
            const newContent = postElement.querySelector('textArea').value.trim()

            if(!newContent){
                alert('Please write something in the field');
                return
            }
        }

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    contentType: 'application/json',
                },
                body: JSON.stringify({body: newContent}),
            })
            if(response.status === 200){}
        } catch (error) {
            
        }

        // const saveButton = document.createElement('button');
        // saveButton.textContent = 'Save';
        // saveButton.className = 'save-post';
        // postElement.querySelector('.post-actions').appendChild(saveButton);
        
    }

})