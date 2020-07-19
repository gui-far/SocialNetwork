const { useEffect } = React

const BACKEND_URL = "http://127.0.0.1:8000"

//App Component
class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            pages: 1,
            posts: [],
            user: {}
        };
    }

    //Runs once
    async componentDidMount() {
        this.loadUser()
        this.loadPosts()
    }


    render() {
        return (
            <div>
                <User user={this.state.user} followUser={this.followUser} />
                {/* <CreatePost savePost={this.savePost} /> */}
                <MyPaginator page={this.state.page} pages={this.state.pages} nextPage={this.nextPage} previousPage={this.previousPage} />
                <Posts posts={this.state.posts} />
            </div>
        );
    }

    nextPage = async () => {
        await this.setState(state => ({
            page: this.state.page + 1
        }));

        this.loadPosts()
    }

    previousPage = async () => {
        await this.setState(state => ({
            page: this.state.page - 1
        }));

        this.loadPosts()
    }

    loadUser = async (username) => {

        username = username || window.location.pathname.replace('/profile/', '')

        var url = new URL(`${BACKEND_URL}/user/${username}`)

        const response = await fetch(url, {
            method: 'GET',
            headers: { "X-CSRFToken": csrfcookie() }
        })

        const user = await response.json()

        this.setState(state => ({
            user: user
        }));

    }

    followUser = async (username) => {

        username = username || window.location.pathname.replace('/profile/', '')

        var url = new URL(`${BACKEND_URL}/follow/${username}`)

        const response = await fetch(url, {
            method: 'PUT',
            headers: { "X-CSRFToken": csrfcookie() }
        })

        //Refresh
        this.loadUser()

    }

    loadPosts = async (username) => {

        const path = window.location.pathname
        let endpoint = ''       

        if (path == '/posts') {
            endpoint = '/post'
        }

        else if (path == '/following') {
            endpoint = '/post/following'
        }

        else { //profile/{user}/posts
            endpoint = path+'/posts'
        }

        var url = new URL(`${BACKEND_URL}${endpoint}`)

        const page = this.state.page
        const params = {page: page}
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key])) 

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-CSRFToken': csrfcookie() }
        })

        const {pages, posts} = await response.json()

        this.setState(state => ({
           pages: pages,
           posts: posts
       }));
    }

    /* savePost = async (id, content) => {

        const method = 'POST'
        const url = new URL(`${BACKEND_URL}/post/`)
        const post = document.getElementById('postContent').value

        const response = await fetch(url, {
            method: method,
            headers: { "X-CSRFToken": csrfcookie() },
            body: JSON.stringify({
                post
            })
        })

        const newPost = await response.json()

        let refreshedPosts = this.state.posts
        refreshedPosts.unshift(newPost)

        this.setState(state => ({
            posts: refreshedPosts
        }));;

    } */

}


class User extends React.Component {
    render() {

        return (
            <div id="user" className="postBorder">
                <div className="profileHeader">
                    <b>{this.props.user.username}</b>

                    {!this.props.user.currentUser

                        ? <button onClick={() => { this.props.followUser() }}>

                            

                            {this.props.user.currentFollowing
                                ? 'Unfollow'
                                : 'Follow'}

                        </button>

                        : ''}
                </div>
                <div className="profileContent">
                    <div>{this.props.user.followers} Followers</div>
                    <div>{this.props.user.following} Following</div>
                </div>
            </div>
        );
    }
}

class Posts extends React.Component {

    render() {

        return (

            this.props.posts.map((post) => {
                return (
                    <Post
                        key={post.id}
                        id={post.id}
                        username={post.username}
                        content={post.content}
                        timestamp={post.timestamp}
                        likes={post.likes}
                        myPost={post.myPost}
                        myLike={post.myLike}
                    />
                )
            })
        )
    }
}

class Post extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            likes: this.props.likes,
            myLike: this.props.myLike
        };
    }

    render() {

        const idContent = `postContent${this.props.id}`
        const text = this.props.content
        const id = this.props.id

        const content = 
        <div className="postContent">
            {this.props.myPost
                ? <p align="center"><button onClick={() => { this.editPost(id, text) }}>Edit Post</button></p>
                : ''}
            <div id={idContent} >
                {this.state.content}
            </div>
        </div>

        const like = 
        <div>
            {this.state.likes}
            <button onClick={async () => {
                    await this.likePost(this.props.id)
                }}>
                    {!this.state.myLike
                    ? "Like"
                    : "Dislike"}
                </button>
        </div>

        return (
            <div id="post" className="postBorder">
                <div className="postHeader"><a href={`/profile/${this.props.username}`}>{this.props.username}</a></div>

                {content}

                <div className="postFooter">

                    {like}

                    <div>
                        {this.props.timestamp}
                    </div>

                </div>
            </div>
        );
    }

    likePost = async (id) => {

        var url = new URL(`${BACKEND_URL}/post/${id}/like`)

        const response = await fetch(url, {
            method: 'POST',
            headers: { "X-CSRFToken": csrfcookie() }
        })

        const { likes } = await response.json()

        this.setState(state => ({
            likes: likes,
            myLike: !state.myLike
        }));

        return likes

    }

    editPost = async (id) => {

        let div = document.getElementById('postContent'+id)
        
        if(div.dataset.mode == 'edit') {

            let aux = document.getElementById('edit_postContent'+id)
            let newContent = aux.value

            const method = 'PUT'
            const url = new URL(`${BACKEND_URL}/post/${id}`)

            const response = await fetch(url, {
                method: method,
                headers: { "X-CSRFToken": csrfcookie() },
                body: JSON.stringify({
                    newContent: newContent
                })
            })

            if (response.status == 400) {
                
                newContent = this.state.content

                const {error} = await response.json()
                alert(error)
            } 

            aux.remove()
            div.innerHTML = newContent
            delete div.dataset.mode

            this.setState(state => ({
                content: newContent
            }));
            

        } else {

            div.dataset.mode = "edit"    

            let textarea = document.createElement('textarea')
            textarea.value = div.innerHTML
            textarea.id = 'edit_postContent'+id

            div.innerHTML = ""
            div.appendChild(textarea)

        }
    }
}

class MyPaginator extends React.Component {


    componentDidUpdate() {
    }

    render() {
        return (

            <div style={{margin: "15px"}}>
                {this.props.pages > 1
                    ? <div className="myPaginator">
                        
                        {this.props.page > 1
                        ? <div className="previousNext" onClick={() => { this.props.previousPage() }}>Previous</div>
                        : ''}

                        
                        <div className="actualPage">{this.props.page}/{this.props.pages}</div>

                        {this.props.page < this.props.pages
                        ? <div className="previousNext" onClick={() => { this.props.nextPage() }}>Next</div>
                        : ''}
                        
                    </div>
                    : ''}
            </div>


        )
    }
}

//Render App
ReactDOM.render(
    <App />,
    document.querySelector("#app")

);



/**
 * 
 * FUNCTIONS
 * 
 */

function csrfcookie() {
    let cookieValue = null,
        name = "csrftoken";
    if (document.cookie && document.cookie !== "") {
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) == (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};
