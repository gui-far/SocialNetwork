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
                    />
                )
            })
        )
    }
}