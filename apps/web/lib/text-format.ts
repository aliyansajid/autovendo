export function formatVehicleName(parts: (string | null | undefined)[]) {
  const raw = parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .join(" ");
  return raw
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((segment) =>
          segment.length ? segment[0].toUpperCase() + segment.slice(1) : "",
        )
        .join("-"),
    )
    .join(" ");
}
