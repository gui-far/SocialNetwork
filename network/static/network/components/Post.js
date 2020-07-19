class Post extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            likes: this.props.likes
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
                const updatedLikes = await this.likePost(this.props.id)
                console.log(this.props.id)
            }}>Like</button>
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
            likes: likes
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

            console.log(url)

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