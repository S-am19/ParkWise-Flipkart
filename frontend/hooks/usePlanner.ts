"use client";

import { useQuery } from "@tanstack/react-query";
import { parkWiseApi } from "@/lib/api";

export function usePlanner(wardens: number) {
  return useQuery({
    queryKey: ["planner", wardens],
    queryFn: () => parkWiseApi.planner(wardens),
    placeholderData: (previous) => previous,
  });
}
