import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface JobListing {
    title: string;
    description: string;
    company: string;
}
export type Time = bigint;
export interface ClassGroup {
    members: Array<string>;
    name: string;
}
export interface UserProfile {
    displayName: string;
    email: string;
    countryCode: string;
    phone: string;
}
export interface ChatConversation {
    contact: string;
    lastMessage: string;
    timestamp: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClassGroup(group: ClassGroup): Promise<void>;
    addJob(job: JobListing): Promise<void>;
    addOrUpdateChat(contact: string, lastMessage: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteChat(contact: string): Promise<void>;
    deleteClassGroup(groupName: string): Promise<void>;
    deleteJob(jobTitle: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChats(): Promise<Array<ChatConversation>>;
    getClassGroups(): Promise<Array<ClassGroup>>;
    getJobs(): Promise<Array<JobListing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProfile(profile: UserProfile): Promise<void>;
}
