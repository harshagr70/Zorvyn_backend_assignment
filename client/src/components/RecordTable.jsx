function ownerId(record) {
  const cb = record.createdBy;
  if (!cb) return null;
  return (cb._id ?? cb).toString();
}

export default function RecordTable({
  records,
  user,
  onEdit,
  onDelete,
  onDeleteNotAllowed,
  canMutate,
}) {
  const isAdmin = user?.role === "admin";
  const isAnalyst = user?.role === "analyst";

  const canEditRow = (record) => {
    if (!canMutate) return false;
    if (isAdmin) return true;
    if (isAnalyst) return ownerId(record) === user?._id?.toString();
    return false;
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record._id}>
            <td>{new Date(record.date).toLocaleDateString()}</td>
            <td>{record.type}</td>
            <td>{record.category}</td>
            <td className={record.type === "income" ? "income" : "expense"}>{record.amount}</td>
            <td>{record.description || "-"}</td>
            <td>
              {canMutate && (
                <>
                  {canEditRow(record) && (
                    <button type="button" onClick={() => onEdit(record)}>
                      Edit
                    </button>
                  )}
                  {isAdmin && (
                    <button type="button" onClick={() => onDelete(record._id)}>
                      Delete
                    </button>
                  )}
                  {isAnalyst && (
                    <button type="button" onClick={() => onDeleteNotAllowed?.()}>
                      Delete
                    </button>
                  )}
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
