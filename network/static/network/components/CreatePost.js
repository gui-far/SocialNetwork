class CreatePost extends React.Component {
    render() {
        return (
            <div id="newPost" className="postBorder">
                <h4>New Post</h4>
                <textarea id="postContent" placeholder="Start a new Post here ..."></textarea>
                <button onClick={() => this.props.savePost()}>Post</button>
            </div>
        );
    }
}