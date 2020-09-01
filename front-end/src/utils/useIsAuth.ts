import { useGetCurrentUserQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useIsAuth = () => {
  const [{data, fetching}] = useGetCurrentUserQuery();
  const router = useRouter();
  //If not loading and you are not logged in, then go to login page immediately
  useEffect(() => {
    if (!fetching && !data?.getCurrentUser) {
      //the router.pathname keeps reference to previous page so then once logged in, can go back to it
      //basically goes to the login page and appends pathname to URL so once logged in, login function can go back to that pathname
      router.replace("/login?next=" + router.pathname);
    }
  }, [data, router]);
}