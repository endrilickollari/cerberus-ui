import { useState, useCallback, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const useApi = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.request(config);
      setData(response.data);
    } catch (err) {
      setError(err);
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return { data, error, loading, request };
};

export default useApi;
