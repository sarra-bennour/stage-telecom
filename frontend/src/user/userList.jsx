import { useState, useEffect } from "react";
import axios from "axios";
import "./user.css";
import PopUp from "../partials/popup";

const roles = [ "superviseur", "technicien"];


const UserList = () => {
    // State
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ nom: "", prenom: "", email: "", password: "", role: "technicien", tel: "" });
    const [addLoading, setAddLoading] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [editRole, setEditRole] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Notifications de suppression (mock, à remplacer par API réelle)
    const [pendingDeletions, setPendingDeletions] = useState([
        // Exemple de structure
        // { id: 1, type: "antenne", label: "Antenne 5G - Station X", entityId: "123" }
    ]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifError, setNotifError] = useState("");
    const [notifSuccess, setNotifSuccess] = useState("");

    const [popup, setPopup] = useState({
        type: "",
        message: "",
        isVisible: false,
    });


    const handleSuccess = (message) => {
    setPopup({ type: "success", message: message, isVisible: true });
    };

    const handleError = (message) => {
        setPopup({ type: "error", message: message, isVisible: true });
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, isVisible: false }));
    };
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("http://localhost:3000/users/check-auth", {
                    withCredentials: true,
                });
                setCurrentUser(response.data.data?.user || null);
            } catch (error) {
                setCurrentUser(null);
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                // Remplacer par l'endpoint réel pour récupérer tous les utilisateurs
                const res = await axios.get("http://localhost:3000/users/users-list", { withCredentials: true });
                setUsers(res.data.data.users || []);
            } catch (err) {
                setError("Erreur lors du chargement des utilisateurs");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Stats
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === "admin").length;
    const superviseurCount = users.filter(u => u.role === "superviseur").length;
    const technicienCount = users.filter(u => u.role === "technicien").length;

    // Filtered and paginated users
    const filteredUsers = users.filter(u =>
        (u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.tel?.toString().includes(searchTerm)) &&
        (!roleFilter || u.role === roleFilter)
    );
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Add user
    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        handleError("");
        handleSuccess("");
        try {
            // Remplacer par l'endpoint réel
            await axios.post("http://localhost:3000/users/create-user", addForm);
            handleSuccess("Utilisateur ajouté avec succès");
            setShowAddModal(false);
            setAddForm({ nom: "", prenom: "", email: "", password: "", role: "technicien", tel: "" });
            // Refresh list
            const res = await axios.get("http://localhost:3000/users/users-list", { withCredentials: true });
            setUsers(res.data.data.users || []);
        } catch (err) {
            handleError("Erreur lors de l'ajout de l'utilisateur");
        } finally {
            setAddLoading(false);
        }
    };

    // Edit role
    const handleEditRole = async (userId) => {
        setEditLoading(true);
        handleError("");
        try {
            await axios.put(`http://localhost:3000/users/update-role/${userId}`, 
                { 
                    role: editRole, 
                    currentUserId: currentUser?._id 
                });
            setEditUserId(null);
            setEditRole("");
            // Refresh list
            const res = await axios.get("http://localhost:3000/users/users-list", { withCredentials: true });
            setUsers(res.data.data.users || []);
        } catch (err) {
            handleError(err.response?.data?.message || "Erreur lors de la modification du rôle");
        } finally {
            setEditLoading(false);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        setDeleteLoading(true);
        handleError("");
        handleSuccess("");
        try {
            // Remplacer par l'endpoint réel
            await axios.delete(`http://localhost:3000/users/delete/${userId}`);
            handleSuccess("Utilisateur supprimé avec succès");
            setDeleteUserId(null);
            // Refresh list
            const res = await axios.get("http://localhost:3000/users/users-list", { withCredentials: true });
            setUsers(res.data.data.users || []);
        } catch (err) {
            handleError("Erreur lors de la suppression de l'utilisateur");
        } finally {
            setDeleteLoading(false);
        }
    };

    // Notifications de suppression (approuver/refuser)
    const handleApproveDeletion = async (notif) => {
        setNotifLoading(true);
        setNotifError("");
        setNotifSuccess("");
        try {
            // Remplacer par l'endpoint réel selon notif.type
            // await axios.post(`http://localhost:3000/${notif.type}s/approve-delete/${notif.entityId}`);
            setNotifSuccess("Suppression approuvée");
            setPendingDeletions(prev => prev.filter(n => n.id !== notif.id));
        } catch (err) {
            setNotifError("Erreur lors de l'approbation de la suppression");
        } finally {
            setNotifLoading(false);
        }
    };
    const handleRejectDeletion = async (notif) => {
        setNotifLoading(true);
        setNotifError("");
        setNotifSuccess("");
        try {
            // Remplacer par l'endpoint réel selon notif.type
            // await axios.post(`http://localhost:3000/${notif.type}s/reject-delete/${notif.entityId}`);
            setNotifSuccess("Suppression refusée");
            setPendingDeletions(prev => prev.filter(n => n.id !== notif.id));
        } catch (err) {
            setNotifError("Erreur lors du refus de la suppression");
        } finally {
            setNotifLoading(false);
        }
    };

    // UI
    return (
        <div className="user-crud">
            <div className="user-crud-container">
                {/* Stats */}
                <div className="user-crud-stats-compact">
                    <div className="user-crud-stat-card total">
                        <div className="user-crud-stat-icon-compact"><i className="fas fa-users"></i></div>
                        <div className="user-crud-stat-info-compact">
                            <dt className="user-crud-stat-label-compact">Total Utilisateurs</dt>
                            <dd className="user-crud-stat-value-compact">{totalUsers}</dd>
                        </div>
                    </div>
                    <div className="user-crud-stat-card admin">
                        <div className="user-crud-stat-icon-compact"><i className="fas fa-user-shield"></i></div>
                        <div className="user-crud-stat-info-compact">
                            <dt className="user-crud-stat-label-compact">Admins</dt>
                            <dd className="user-crud-stat-value-compact">{adminCount}</dd>
                        </div>
                    </div>
                    <div className="user-crud-stat-card superviseur">
                        <div className="user-crud-stat-icon-compact"><i className="fas fa-user-tie"></i></div>
                        <div className="user-crud-stat-info-compact">
                            <dt className="user-crud-stat-label-compact">Superviseurs</dt>
                            <dd className="user-crud-stat-value-compact">{superviseurCount}</dd>
                        </div>
                    </div>
                    <div className="user-crud-stat-card technicien">
                        <div className="user-crud-stat-icon-compact"><i className="fas fa-user-cog"></i></div>
                        <div className="user-crud-stat-info-compact">
                            <dt className="user-crud-stat-label-compact">Techniciens</dt>
                            <dd className="user-crud-stat-value-compact">{technicienCount}</dd>
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="user-crud-filters">
                    <div className="user-crud-search-container">
                        <div className="user-crud-search-icon"><i className="fas fa-search"></i></div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="user-crud-search-input"
                            placeholder="Rechercher par nom, prénom, email ou téléphone..."
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="user-crud-select"
                    >
                        <option value="">Tous les rôles</option>
                        <option value="admin">Admin</option>
                        <option value="superviseur">Superviseur</option>
                        <option value="technicien">Technicien</option>
                    </select>
                    <button className="user-crud-add-btn" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-plus"></i> Nouvel utilisateur
                    </button>
                </div>

                {/* Table utilisateurs */}
                <div className="user-crud-table-container">
                    <table className="user-crud-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="user-crud-loading">Chargement...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="user-crud-error">{error}</td></tr>
                            ) : currentUsers.length === 0 ? (
                                <tr><td colSpan="6" className="user-crud-empty">Aucun utilisateur trouvé</td></tr>
                            ) : (
                                currentUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.nom}</td>
                                        <td>{user.prenom}</td>
                                        <td>{user.email}</td>
                                        <td>{user.tel}</td>
                                        <td>
                                            {editUserId === user._id ? (
                                                <select
                                                    value={editRole}
                                                    onChange={e => setEditRole(e.target.value)}
                                                    className="user-crud-select"
                                                >
                                                    {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`user-crud-badge role-${user.role}`}>{user.role}</span>
                                            )}
                                        </td>
                                        <td>
                                            {editUserId === user._id ? (
                                                <>
                                                    <button className="user-crud-action-btn save" onClick={() => handleEditRole(user._id)} disabled={editLoading}>
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                    <button className="user-crud-action-btn cancel" onClick={() => setEditUserId(null)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="user-crud-action-btn edit" onClick={() => { setEditUserId(user._id); setEditRole(user.role); }}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="user-crud-action-btn delete" onClick={() => setDeleteUserId(user._id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="user-crud-pagination">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="user-crud-pagination-btn">
                            <i className="fas fa-chevron-left"></i> Précédent
                        </button>
                        <span>Page {currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="user-crud-pagination-btn">
                            Suivant <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}

                {/* Modal ajout utilisateur */}
                {showAddModal && (
                    <div className="user-crud-modal-overlay">
                        <div className="user-crud-modal">
                            <div className="user-crud-modal-header">
                                <h3><i className="fas fa-user-plus"></i> Ajouter un utilisateur</h3>
                                <button className="user-crud-modal-close" onClick={() => setShowAddModal(false)}><i className="fas fa-times"></i></button>
                            </div>
                            <form className="user-crud-modal-form" onSubmit={handleAddUser}>
                                <div className="user-crud-modal-grid">
                                    <input type="text" placeholder="Nom" value={addForm.nom} onChange={e => setAddForm(f => ({ ...f, nom: e.target.value }))} required />
                                    <input type="text" placeholder="Prénom" value={addForm.prenom} onChange={e => setAddForm(f => ({ ...f, prenom: e.target.value }))} required />
                                    <input type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} required />
                                    <input type="password" placeholder="Mot de passe" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} required />
                                    <input type="tel" placeholder="Téléphone" value={addForm.tel} onChange={e => setAddForm(f => ({ ...f, tel: e.target.value }))} required />
                                    <select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))} required>
                                        {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                    </select>
                                </div>
                                
                                <div className="user-crud-modal-actions">
                                    <button type="button" className="user-crud-modal-cancel" onClick={() => setShowAddModal(false)}>Annuler</button>
                                    <button type="submit" className="user-crud-modal-submit" disabled={addLoading}>{addLoading ? "Ajout..." : "Ajouter"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal suppression utilisateur */}
                {deleteUserId && (
                    <div className="user-crud-modal-overlay">
                        <div className="user-crud-modal">
                            <div className="user-crud-modal-header">
                                <h3><i className="fas fa-user-times"></i> Supprimer l'utilisateur</h3>
                                <button className="user-crud-modal-close" onClick={() => setDeleteUserId(null)}><i className="fas fa-times"></i></button>
                            </div>
                            <div className="user-crud-modal-body">
                                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                            </div>
                            <div className="user-crud-modal-actions">
                                <button className="user-crud-modal-cancel" onClick={() => setDeleteUserId(null)}>Annuler</button>
                                <button className="user-crud-modal-submit" onClick={() => handleDeleteUser(deleteUserId)} disabled={deleteLoading}>{deleteLoading ? "Suppression..." : "Supprimer"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications de suppression */}
                <div className="user-crud-notif-section">
                    <h3><i className="fas fa-bell"></i> Notifications de suppression en attente</h3>
                    {notifError && <div className="user-crud-error">{notifError}</div>}
                    {notifSuccess && <div className="user-crud-success">{notifSuccess}</div>}
                    {pendingDeletions.length === 0 ? (
                        <div className="user-crud-notif-empty">Aucune notification en attente</div>
                    ) : (
                        <ul className="user-crud-notif-list">
                            {pendingDeletions.map(notif => (
                                <li key={notif.id} className={`user-crud-notif-item notif-${notif.type}`}>
                                    <span className="user-crud-notif-label">
                                        <i className={`fas fa-${notif.type === "antenne" ? "tower-cell" : notif.type === "transmission" ? "network-wired" : "exclamation-triangle"}`}></i>
                                        {notif.label}
                                    </span>
                                    <div className="user-crud-notif-actions">
                                        <button className="user-crud-action-btn approve" onClick={() => handleApproveDeletion(notif)} disabled={notifLoading}><i className="fas fa-check"></i> Approuver</button>
                                        <button className="user-crud-action-btn reject" onClick={() => handleRejectDeletion(notif)} disabled={notifLoading}><i className="fas fa-times"></i> Refuser</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {/* PopUp */}
            <PopUp type={popup.type} message={popup.message} isVisible={popup.isVisible} onClose={closePopup} />
        </div> 
    );
};

export default UserList;
