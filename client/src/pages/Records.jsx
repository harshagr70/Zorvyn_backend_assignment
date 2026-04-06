import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import RecordTable from "../components/RecordTable";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../constants/categories";

const defaultForm = {
  amount: "",
  type: "expense",
  category: "food",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

export default function Records() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [listError, setListError] = useState(null);

  const canMutate = user?.role === "admin" || user?.role === "analyst";

  const fetchRecords = async (page = 1) => {
    setListError(null);
    const { data } = await api.get(`/records?page=${page}&limit=10`);
    setRecords(data.data);
    setMeta(data.meta || { page: 1, totalPages: 1 });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const resetModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setSaveError(null);
  };

  const openNewRecord = () => {
    setEditingId(null);
    setForm(defaultForm);
    setSaveError(null);
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaveError(null);

    const amountNum = Number(form.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setSaveError("Enter a valid positive amount.");
      return;
    }

    const payload = {
      amount: amountNum,
      type: form.type,
      category: form.category,
      date: new Date(form.date).toISOString(),
      ...(form.description?.trim() ? { description: form.description.trim() } : {}),
    };

    try {
      if (editingId) {
        await api.patch(`/records/${editingId}`, payload);
      } else {
        await api.post("/records", payload);
      }
      resetModal();
      await fetchRecords(meta.page);
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.error?.details?.map((d) => d.message).join(" ") ||
        err?.message ||
        "Could not save record.";
      setSaveError(msg);
    }
  };

  const onDelete = async (id) => {
    setListError(null);
    try {
      await api.delete(`/records/${id}`);
      await fetchRecords(meta.page);
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Could not delete record.";
      setListError(msg);
    }
  };

  const onDeleteNotAllowed = () => {
    setListError("You don't have permission to delete records. Only administrators can delete.");
  };

  const onEdit = (record) => {
    setEditingId(record._id);
    setForm({
      amount: String(record.amount),
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().slice(0, 10),
      description: record.description || "",
    });
    setSaveError(null);
    setOpen(true);
  };

  return (
    <Layout>
      <div className="row-between">
        <h2>Records</h2>
        {canMutate && <button onClick={openNewRecord}>Add Record</button>}
      </div>

      {user?.role === "analyst" && (
        <p className="hint" style={{ marginBottom: 12, color: "#4b5563" }}>
          You can edit only records you created. Seeded demo data randomly assigns each row to admin or analyst—rows
          attributed to you in the database are editable. Only admins can delete.
        </p>
      )}

      {listError && (
        <p className="error" style={{ marginBottom: 12 }}>
          {listError}
        </p>
      )}

      <RecordTable
        records={records}
        user={user}
        canMutate={canMutate}
        onEdit={onEdit}
        onDelete={onDelete}
        onDeleteNotAllowed={onDeleteNotAllowed}
      />
      <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} onPage={fetchRecords} />

      <Modal
        open={open}
        title={editingId ? "Edit Record" : "New Record"}
        onClose={resetModal}
      >
        <form className="form" onSubmit={onSave}>
          {saveError && <p className="error">{saveError}</p>}
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
            <option value="income">income</option>
            <option value="expense">expense</option>
          </select>
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
          <label>Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button type="submit">Save</button>
        </form>
      </Modal>
    </Layout>
  );
}
