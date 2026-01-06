import { useUser } from "@clerk/clerk-react";

export default function Profile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div>
      <p>User ID: {user.id}</p>
      <p>Email: {user.primaryEmailAddress.emailAddress}</p>
    </div>
  );
}
