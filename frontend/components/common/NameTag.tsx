export function NameTag({
  name,
  email
}: {
  name: string;
  email: string;
}) {
      return (
        <div className="h-10 flex flex-col justify-center gap-0.5">
          <div className="leading-tight">{name}</div>
          <small className="leading-tight" style={{ color: "#777"}}>{email}</small>
        </div>
      )
}