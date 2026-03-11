import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatConversation, ClassGroup, JobListing } from "../backend.d";
import { useActor } from "./useActor";

export function useGetChats() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatConversation[]>({
    queryKey: ["chats"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getChats();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClassGroups() {
  const { actor, isFetching } = useActor();
  return useQuery<ClassGroup[]>({
    queryKey: ["classGroups"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getClassGroups();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<JobListing[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getJobs();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddChat() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contact,
      message,
    }: { contact: string; message: string }) => {
      if (!actor) return;
      await actor.addOrUpdateChat(contact, message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });
}
