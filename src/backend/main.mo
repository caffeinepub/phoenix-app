import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // User Profile Types and Comparison Module
  public type UserProfile = {
    email : Text;
    phone : Text;
    countryCode : Text;
    displayName : Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.displayName, profile2.displayName)) {
        case (#equal) { Text.compare(profile1.email, profile2.email) };
        case (order) { order };
      };
    };

    public func compareByEmail(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.email, profile2.email);
    };
  };

  // Chat Conversation Types and Comparison Module
  public type ChatConversation = {
    contact : Text;
    lastMessage : Text;
    timestamp : Time.Time;
  };

  module ChatConversation {
    public func compare(chat1 : ChatConversation, chat2 : ChatConversation) : Order.Order {
      if (chat1.timestamp < chat2.timestamp) {
        #less;
      } else if (chat1.timestamp > chat2.timestamp) {
        #greater;
      } else {
        Text.compare(chat1.contact, chat2.contact);
      };
    };
  };

  // Class Group Types and Comparison Module
  public type ClassGroup = {
    name : Text;
    members : [Text];
  };

  module ClassGroup {
    public func compare(group1 : ClassGroup, group2 : ClassGroup) : Order.Order {
      Text.compare(group1.name, group2.name);
    };
  };

  // Job Listing Types and Comparison Module
  public type JobListing = {
    title : Text;
    company : Text;
    description : Text;
  };

  module JobListing {
    public func compare(job1 : JobListing, job2 : JobListing) : Order.Order {
      Text.compare(job1.title, job2.title);
    };
  };

  // Initialize authorization state using prefabricated component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent Maps for Data Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let chats = Map.empty<Principal, [ChatConversation]>();
  let classGroups = Map.empty<Principal, [ClassGroup]>();
  
  // Job listings are global, not per-user
  var globalJobListings : [JobListing] = [];

  // User Profile Functions (required by frontend)
  
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy function for backward compatibility
  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update their profile");
    };
    userProfiles.add(caller, profile);
  };

  // Chat Conversation Functions
  
  public shared ({ caller }) func addOrUpdateChat(contact : Text, lastMessage : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add or update chats");
    };

    let newChat : ChatConversation = {
      contact;
      lastMessage;
      timestamp = Time.now();
    };

    let userChats = switch (chats.get(caller)) {
      case (?existingChats) { existingChats };
      case (null) { [] };
    };

    // Replace or add new chat
    let updatedChats = userChats.filter(
      func(chat) {
        chat.contact != contact;
      }
    ).concat([newChat]);

    chats.add(caller, updatedChats);
  };

  public query ({ caller }) func getChats() : async [ChatConversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get chats");
    };
    switch (chats.get(caller)) {
      case (?existingChats) { existingChats.sort() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func deleteChat(contact : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete chats");
    };

    let userChats = switch (chats.get(caller)) {
      case (?existingChats) { existingChats };
      case (null) { [] };
    };

    let updatedChats = userChats.filter(
      func(chat) {
        chat.contact != contact;
      }
    );

    chats.add(caller, updatedChats);
  };

  // Class Group Functions
  
  public shared ({ caller }) func addClassGroup(group : ClassGroup) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add class groups");
    };

    let userGroups = switch (classGroups.get(caller)) {
      case (?existingGroups) { existingGroups };
      case (null) { [] };
    };

    classGroups.add(caller, userGroups.concat([group]));
  };

  public query ({ caller }) func getClassGroups() : async [ClassGroup] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get class groups");
    };
    switch (classGroups.get(caller)) {
      case (?userGroups) { userGroups.sort() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func deleteClassGroup(groupName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete class groups");
    };

    let userGroups = switch (classGroups.get(caller)) {
      case (?existingGroups) { existingGroups };
      case (null) { [] };
    };

    let updatedGroups = userGroups.filter(
      func(group) {
        group.name != groupName;
      }
    );

    classGroups.add(caller, updatedGroups);
  };

  // Job Listing Functions
  
  public query ({ caller }) func getJobs() : async [JobListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get jobs");
    };
    globalJobListings.sort();
  };

  public shared ({ caller }) func addJob(job : JobListing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add jobs");
    };

    globalJobListings := globalJobListings.concat([job]);
  };

  public shared ({ caller }) func deleteJob(jobTitle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete jobs");
    };

    globalJobListings := globalJobListings.filter(
      func(job) {
        job.title != jobTitle;
      }
    );
  };
};
