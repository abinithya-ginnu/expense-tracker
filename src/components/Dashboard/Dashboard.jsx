import React, { useEffect, useState } from 'react'
import LoginNav from '../LoginNav/LoginNav';
import TransactionBanner from '../TransactionBanner/TransactionBanner';
import LineGraph from '../LineGraph/LineGraph';
import CategoricalExpenses from '../CategoricalExpenses/CategoricalExpenses';
import './Dashboard.css';
import RecentTransactions from '../RecentTransactions/RecentTransactions';
import BarGraph from '../BarGraph/BarGraph';
import { formatNum } from '../../App';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { DashboardCustomize, SpaceDashboard } from '@mui/icons-material';

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [catExpenses, setCatExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0.0);
  const [cashFlowExpense, setCashFlowExpense] = useState(Array(12).fill(0));
  const [cashFlowIncome, setCashFlowIncome] = useState(Array(12).fill(0));
  const [cashFlowBalance, setCashFlowBalance] = useState(Array(12).fill(0));
  const [recentTransactions, setRecentTransactions] = useState([]);
  let viewAsUser = sessionStorage.getItem('id');
  const location = useLocation();
  if(location.state != null) {
    viewAsUser = location.state.id;
  } else {
    viewAsUser = sessionStorage.getItem('id');
  }

  const reload = () => {
    getSummary();
    getCategoricalExpenses();
    getCashFlow();
    getRecentTransactions();
  }
  
  const [headers, setHeaders] = useState(
    {
      "Authorization" : "Bearer " + sessionStorage.getItem("token")
    }
  )

  const getSummary = () => {
    axios.get("http://localhost:8080/monthlysummary?userId=" + viewAsUser,{headers:headers}).then(
        (response)=>{
          if(response.data.code === 200) {
            setSummary(JSON.parse(response.data.summary));
            var expenseObj = JSON.parse(response.data.summary).filter((value) => value.title === "Expense");
            expenseObj.length > 0 && setTotalExpense(expenseObj[0].amount);
          }
        }).catch((err)=> {
          console.log(err);
      })
  }

  const getCategoricalExpenses = () => {
    axios.get("http://localhost:8080/categoricalexpenses?userId=" + viewAsUser,{headers:headers}).then(
        (response)=>{
          if(response.data.code === 200) {
            setCatExpenses(response.data.categoricalExpenses);
          }
        }).catch((err)=> {
          console.log(err);
      })
  }
  const getCashFlow = () => {
    axios.get("http://localhost:8080/cashflow?userId=" + viewAsUser + "&year=" + new Date().getFullYear(),{headers:headers}).then(
      (response) => {
        if(response.data.code === 200) {
          setCashFlowExpense(response.data.expenses);
          setCashFlowIncome(response.data.income);
          setCashFlowBalance(response.data.balance);
        }
      }
    ).catch((err)=> {
      console.log(err);
    })
  }
  const getRecentTransactions = () => {
    axios.get("http://localhost:8080/recenttransactions?userId=" + viewAsUser,{headers:headers}).then(  
      (response) => {
        if(response.data.code === 200) {
          setRecentTransactions(response.data.recentTransactions);
        }
      }
    ).catch((err)=> {
      console.log(err);
    })
  }
 
  useEffect(() => {
    getSummary();
    getCategoricalExpenses();
    getCashFlow();
    getRecentTransactions();
  }, [viewAsUser])

  return (
    <div className='exp-dashboard'>
      <LoginNav reload={reload}/>
      <div className='content'>
        {sessionStorage.getItem("isAdmin") === 'true' && location.state != null &&
        <div className="view-as">
          <h4 style={{ fontWeight: '600' }}>{location.state.name}</h4><p>'s</p><h4>&nbsp;<SpaceDashboard /></h4>
        </div>
        }
        <div className='first-row d-flex justify-content-between'>
          {summary.map((trans) => (
            <div className={`${trans.title.toLowerCase()}${'-tran'}`}>
              <TransactionBanner  title={trans.title.toUpperCase()} amount={formatNum(trans.amount)} />
            </div>
          ))}
        </div>
        <div className='second-row d-flex flex-direction-column justify-content-between'>
          <div className='line-graph'>
            <LineGraph income={cashFlowIncome} expense={cashFlowExpense} balance={cashFlowBalance}/>
          </div>
          <div className='log-details'>
            <CategoricalExpenses data={catExpenses} totalExpense={totalExpense}/>
          </div>
        </div>
        <div className='third-row d-flex flex-direction-column justify-content-between'>
          <div className='recent-trans'>
            <RecentTransactions data={recentTransactions}/>
          </div>
          <div className='bargraph'>
            <BarGraph income={cashFlowIncome} expense={cashFlowExpense}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
