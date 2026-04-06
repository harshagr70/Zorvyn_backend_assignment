import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";

export default function Users() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (id, payload) => {
    await api.patch(`/users/${id}`, payload);
    await fetchUsers();
  };

  return (
    <Layout>
      <h2>User Management</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select value={user.role} onChange={(e) => updateUser(user._id, { role: e.target.value })}>
                  <option value="viewer">viewer</option>
                  <option value="analyst">analyst</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <select value={user.status} onChange={(e) => updateUser(user._id, { status: e.target.value })}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
