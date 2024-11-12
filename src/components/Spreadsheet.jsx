import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export function Spreadsheet() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newData, setNewData] = useState({
    companySigDate: "",
    companySignatureName: "",
    documentName: "",
    documentStatus: "",
    documentType: "",
    employeeNumber: "",
    employeeSigDate: "",
    employeeSignatureName: "",
  });

  const navigate = useNavigate();

  // Проверка аутентификации и получение данных
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }
    fetchData(token);
  }, [navigate]);

  // Функция для получения данных
  const fetchData = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://test.v5.pryaniky.com/ru/data/v3/testmethods/docs/userdocs/get",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth": token,
          },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        setError("Ошибка при загрузке данных");
      }
    } catch (err) {
      setError("Ошибка при соединении с сервером");
    } finally {
      setLoading(false);
    }
  };

  // Функция добавления записи
  const addData = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        "https://test.v5.pryaniky.com/ru/data/v3/testmethods/docs/userdocs/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth": token,
          },
          body: JSON.stringify(newData),
        }
      );
      const result = await response.json();
    //   console.log(typeof result === 'object', '^^^')
    console.log(response, '^^^')
      if (response.ok) {
        
        setData((prevData) => [...prevData, result]);
        setNewData({
          companySigDate: "",
          companySignatureName: "",
          documentName: "",
          documentStatus: "",
          documentType: "",
          employeeNumber: "",
          employeeSigDate: "",
          employeeSignatureName: "",
        });
      } else {
        setError("Ошибка при добавлении данных");
      }
    } catch (err) {
      setError("Ошибка при добавлении данных");
    }
  };

  // Функция удаления записи
  const deleteData = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `https://test.v5.pryaniky.com/ru/data/v3/testmethods/docs/userdocs/delete/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth": token,
          },
        }
      );
      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
      } else {
        setError("Ошибка при удалении данных");
      }
    } catch (err) {
      setError("Ошибка при удалении данных");
    }
  };

  // Функция обновления записи
  const updateData = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `https://test.v5.pryaniky.com/ru/data/v3/testmethods/docs/userdocs/set/${editData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth": token,
          },
          body: JSON.stringify(editData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setData((prevData) =>
          prevData.map((item) => (item.id === editData.id ? result.data : item))
        );
        setEditDialogOpen(false);
      } else {
        setError("Ошибка при обновлении данных");
      }
    } catch (err) {
      setError("Ошибка при обновлении данных");
    }
  };

  // Обработка открытия и закрытия диалогового окна редактирования
  const openEditDialog = (row) => {
    setEditData(row);
    setEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditData(null);
  };

  return (
    <TableContainer>
      <h2>Таблица документов</h2>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Signature Date</TableCell>
                <TableCell>Company Signature Name</TableCell>
                <TableCell>Document Name</TableCell>
                <TableCell>Document Status</TableCell>
                <TableCell>Document Type</TableCell>
                <TableCell>Employee Number</TableCell>
                <TableCell>Employee Signature Date</TableCell>
                <TableCell>Employee Signature Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.companySigDate}</TableCell>
                  <TableCell>{row.companySignatureName}</TableCell>
                  <TableCell>{row.documentName}</TableCell>
                  <TableCell>{row.documentStatus}</TableCell>
                  <TableCell>{row.documentType}</TableCell>
                  <TableCell>{row.employeeNumber}</TableCell>
                  <TableCell>{row.employeeSigDate}</TableCell>
                  <TableCell>{row.employeeSignatureName}</TableCell>
                  <TableCell>
                    <Button onClick={() => openEditDialog(row)}>Edit</Button>
                    <Button onClick={() => deleteData(row.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Добавление записи */}
          <h3>Добавить новую запись</h3>
          {Object.keys(newData).map((field) => (
            <TextField
              key={field}
              label={field}
              value={newData[field]}
              onChange={(e) =>
                setNewData({ ...newData, [field]: e.target.value })
              }
              margin="dense"
              variant="outlined"
            />
          ))}
          <Button onClick={addData}>Add Record</Button>

          {/* Диалоговое окно редактирования */}
          <Dialog open={editDialogOpen} onClose={closeEditDialog}>
            <DialogTitle>Редактировать запись</DialogTitle>
            <DialogContent>
              {Object.keys(newData).map((field) => (
                <TextField
                  key={field}
                  label={field}
                  value={editData ? editData[field] : ""}
                  onChange={(e) =>
                    setEditData({ ...editData, [field]: e.target.value })
                  }
                  margin="dense"
                  variant="outlined"
                />
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={updateData}>Save</Button>
              <Button onClick={closeEditDialog}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </TableContainer>
  );
}
