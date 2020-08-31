import { NavBar } from "../components/NavBar";
import { withUrqlClient} from 'next-urql'
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetAllPostsQuery } from "../generated/graphql"

const Index = () => {
  const [{data}] = useGetAllPostsQuery()
  return (
    <div>
      <NavBar />
      Hello World
      {!data ? (
        <div> Loading...</div>
      ) : (
        data.getAllPosts.map((p) => <div key={p.id}> {p.title}</div>)
      )}
    </div>
  )  
}

//ssr true sets up the serverside exchange
//we have dynamic content so want to server side render
//HOW SSR WORKS
// -> client goes on website and makes request to next.js server at locahost:3000
// -> next.js serevr makes graphql request to express server at localhost:4000
// -> the html is built on localhost:4000 and sent back to the browser
//NOTE -> will only SSR once as the page initially loads. eg. if we go to next page and press back button to page which already SSR, client side rendering would happen instead
export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
