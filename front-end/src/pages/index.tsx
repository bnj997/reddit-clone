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

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
