import { useGetCurrentUserQuery } from "../generated/graphql";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useIsAuth = () => {
  const [{data, fetching}] = useGetCurrentUserQuery();
  const router = useRouter();
  //If not loading and you are not logged in, then go to login page immediately
  useEffect(() => {
    if (!fetching && !data?.getCurrentUser) {
      router.replace("/login")
    }
  }, [data, router]);
}