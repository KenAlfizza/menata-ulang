export function formatDate(dateString: string | Date) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

// Output: July 2, 2026