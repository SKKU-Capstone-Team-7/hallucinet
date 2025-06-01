export function NameTag({
  name,
  email
}: {
  name: string;
  email: string;
}) {
      return (
        <div>
          <div>{name}</div>
          <small style={{ color: "#777"}}>{email}</small>
        </div>
      )
}