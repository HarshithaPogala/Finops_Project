import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Backdrop
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import toast from "react-hot-toast";
import axios from "axios";
import { getAccounts } from "../../utils/get-accounts.js";
import BarLoader from "react-spinners/BarLoader"; // Import BarLoader
import "./Ec2Recommendation.css"; // Import CSS for disabling content

const Ec2Recommendation = () => {
  const [accounts, setAccounts] = useState([]);
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState({}); // Add service loading state
  const [ec2Data, setEc2Data] = useState({});
  const [ebsData, setEbsData] = useState({});
  const [snapshotData, setSnapshotData] = useState({});
  const [volumeSnapshotData, setVolumeSnapshotData] = useState({});
  const [ec2WeekendsData, setEc2WeekendsData] = useState({});
  const [rdsWeekendsData, setRdsWeekendsData] = useState({});
  const [unattachedElasticipData, setUnattachedElasticipData] = useState({});
  const [underutilisedEc2Data, setUnderutilisedEc2Data] = useState({});
  const [underutilisedRdsData, setUnderutilisedRdsData] = useState({});
  const [s3MultipartUploadData, setS3MultipartUploadData] = useState({});
  const [lambdaMemoryRightSizing, setLambdaMemoryRightSizing] = useState({});
  const [lambdaMemoryRightUnderprovisioned, setLambdaMemoryRightUnderprovisioned] = useState({});
  const [ebsVolumesRecom, setEbsVolumesRecom] = useState({});
  const [error, setError] = useState(null);


  const currentUser = localStorage.getItem("user");

  const modifyEC2Instance = async (instance, accountId) => {
    setServiceLoading((prev) => ({ ...prev, ec2: true })); // Set service loading state
    instance = { ...instance, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/modifyEC2Instance`,
      data: instance,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newEC2Data = ec2Data.filter(item => item.instance_id !== instance.instance_id)
    setEc2Data(newEC2Data)
    setServiceLoading((prev) => ({ ...prev, ec2: false })); // Reset service loading state
  }

  const modifyVolume = async (volume, accountId) => {
    setServiceLoading((prev) => ({ ...prev, ebs: true })); // Set service loading state
    volume = { ...volume, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/modifyVolume`,
      data: volume,
      headers: {
        "Content-Type": "application/json", // Keep Content-Type header
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`, // Add Authorization header with the secret token
      },
    });
    toast(data);
    const newEbsData = ebsData.filter(item => item['EBS Volume ID'] !== volume['EBS Volume ID'])
    setEbsData(newEbsData)
    setServiceLoading((prev) => ({ ...prev, ebs: false })); // Reset service loading state
  }

  const convertVolumeToSnapshot = async (volume, accountId) => {
    setServiceLoading((prev) => ({ ...prev, volumeSnapshot: true })); // Set service loading state
    volume = { ...volume, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/convertVolumeToSnapshot`,
      data: volume,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newVolumeSnapshotData = volumeSnapshotData.filter(item => item['EBS Volume ID'] !== volume['EBS Volume ID'])
    setVolumeSnapshotData(newVolumeSnapshotData)
    setServiceLoading((prev) => ({ ...prev, volumeSnapshot: false })); // Reset service loading state
  }

  const deleteSnapshot = async (volume, accountId) => {
    setServiceLoading((prev) => ({ ...prev, snapshot: true })); // Set service loading state
    volume = { ...volume, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/deleteIncrementalSnapshots`,
      data: volume,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newSnapshotData = snapshotData.filter(item => item['EBS Volume ID'] !== volume['EBS Volume ID'])
    setSnapshotData(newSnapshotData)
    setServiceLoading((prev) => ({ ...prev, snapshot: false })); // Reset service loading state
  }

  const rdsStopStart = async (rdsData, accountId) => {
    setServiceLoading((prev) => ({ ...prev, rds: true })); // Set service loading state
    rdsData = { ...rdsData, accountId: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/rdsStopStart`,
      data: rdsData,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    rdsWeekendsData.RDSDetails = rdsWeekendsData.RDSDetails.filter(item => item['DBInstanceIdentifier'] != rdsData['DBInstanceIdentifier'])
    setRdsWeekendsData(null)
    setRdsWeekendsData(rdsWeekendsData);
    setServiceLoading((prev) => ({ ...prev, rds: false })); // Reset service loading state
  }

  const ec2StopStart = async (ec2Data, accountId) => {
    setServiceLoading((prev) => ({ ...prev, ec2Weekends: true })); // Set service loading state
    ec2Data = { ...ec2Data, accountId: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/ec2StopStart`,
      data: ec2Data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    ec2WeekendsData.EC2Details = ec2WeekendsData.EC2Details.filter(item => item['InstanceId'] != ec2Data['InstanceId'])
    setEc2WeekendsData(null)
    setEc2WeekendsData(ec2WeekendsData);
    setServiceLoading((prev) => ({ ...prev, ec2Weekends: false })); // Reset service loading state
  }

  const unattachElasticip = async (ipAddress, accountId) => {
    setServiceLoading((prev) => ({ ...prev, elasticIp: true })); // Set service loading state
    const unattachData = { ip_address: ipAddress, accountId: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/deleteUnattachedElasticip`,
      data: unattachData,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newUnattachedElasticipData = unattachedElasticipData.filter(item => item.ip_address !== ipAddress)
    setUnattachedElasticipData(newUnattachedElasticipData)
    setServiceLoading((prev) => ({ ...prev, elasticIp: false })); // Reset service loading state
  }

  const underutilisedEc2 = async (instance, accountId) => {
    setServiceLoading((prev) => ({ ...prev, underutilisedEc2: true })); // Set service loading state
    instance = { ...instance, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/updateUnderutilisedEc2`,
      data: instance,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newUnderutilisedEc2Data = underutilisedEc2Data.filter(item => item.InstanceId !== instance.InstanceId)
    setUnderutilisedEc2Data(newUnderutilisedEc2Data)
    setServiceLoading((prev) => ({ ...prev, underutilisedEc2: false })); // Reset service loading state
  }

  const underutilisedRds = async (instance, accountId) => {
    setServiceLoading((prev) => ({ ...prev, underutilisedRds: true })); // Set service loading state
    instance = { ...instance, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/updateUnderutilisedRds`,
      data: instance,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newUnderutilisedRdsData = underutilisedRdsData.filter(item => item.DBInstanceIdentifier !== instance.DBInstanceIdentifier)
    setUnderutilisedRdsData(newUnderutilisedRdsData)
    setServiceLoading((prev) => ({ ...prev, underutilisedRds: false })); // Reset service loading state
  }
  const s3MultipartUpload = async (s3, accountId) => {
    setServiceLoading((prev) => ({ ...prev, s3: true })); // Set service loading state
    s3 = { ...s3, account_id: accountId, user: currentUser }
    const { data } = await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}recommendation/putLifecycleConf`,
      data: s3,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
      },
    });
    toast(data);
    const newS3MultipartUploadData = s3MultipartUploadData.filter(item => item.Bucket !== s3.Bucket)
    setS3MultipartUploadData(newS3MultipartUploadData)
    setServiceLoading((prev) => ({ ...prev, s3: false })); // Reset service loading state
  }

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await getAccounts(currentUser);
        console.log(accounts); // Debugging: Log fetched accounts
        setAccounts(accounts);
      } catch (err) {
        console.error("Error fetching account IDs:", err);
        setError("Failed to fetch account IDs");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [currentUser]);

  // Add this useEffect to handle main loader state
  useEffect(() => {
    const isAnyServiceLoading = Object.values(serviceLoading).some((isLoading) => isLoading);
    const hasExpandedAccount = expandedAccount !== null;
    
    if (isAnyServiceLoading || hasExpandedAccount) {
      setLoading(false);
    }
  }, [serviceLoading, expandedAccount]);

  const fetchEc2Data = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/ec2oldnewgeneration?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data.map((item) => ({
        ...item,
        old_cost: parseFloat(item.old_cost).toFixed(2),
        new_cost: parseFloat(item.new_cost).toFixed(2),
      }));
    } catch (err) {
      console.error("Error fetching EC2 data:", err);
      return [];
    }
  };

  const fetchEbsData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getEbsVolumes?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data?.map((item) => ({
        ...item,
        "Current Monthly Cost": parseFloat(
          item["Current Monthly Cost"].replace("$", "")
        ).toFixed(2),
        "Recommended Monthly Cost": parseFloat(
          item["Recommended Monthly Cost"].replace("$", "")
        ).toFixed(2),
      }));
    } catch (err) {
      console.error("Error fetching Ebs data:", err);
      return [];
    }
  };

  const fetchLatestSnapshotData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getLatestSnapshots?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data?.map((item) => ({
        ...item,
        "Snapshot Cost": parseFloat(item["Snapshot Cost"].replace("$", "")).toFixed(2),
        Savings: parseFloat(item["Savings"].replace("$", "").replace(" per month", "")).toFixed(2),
      }));
    } catch (err) {
      console.error("Error fetching snapshot data:", err);
      return [];
    }
  };

  const fetchAvailableVolumeRecommendedSnapshotData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getAvailableVolumeRecommendedSnapshot?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data?.map((item) => ({
        ...item,
        "Monthly Cost": parseFloat(item["Monthly Cost"].replace("$", "")).toFixed(2),
        "Snapshot Cost": parseFloat(item["Snapshot Cost"].replace("$", "")).toFixed(2),
        Savings: parseFloat(item["Savings"].replace("$", "").replace(" per month", "")).toFixed(2),
      }));
    } catch (err) {
      console.error("Error fetching snapshot data:", err);
      return [];
    }
  };

  const fetchRDSinstancesData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getRDSinstances?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching rds data:", err);
      return [];
    }
  };

  const fetchEC2instancesData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getEC2instances?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching ec2 data:", err);
      return [];
    }
  };

  const fetchUnattachedElasticipData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getUnattachedElasticip?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching elastic ip data:", err);
      return [];
    }
  };

  const fetchUnderutilisedEc2Data = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getUnderutilisedEc2?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching Underutilised Ec2 data:", err);
      return [];
    }
  };

  const fetchUnderutilisedRdsData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getUnderutilisedRds?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching Underutilised rds data:", err);
      return [];
    }
  };

  const fetchS3MultipartUploadData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getS3MultipartUpload?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching S3 Multipart Upload data:", err);
      return [];
    }
  };

  const fetchlambdaMemoryRightSizingData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getlambdaMemoryRightSizing?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching lambda Memory RightSizing data:", err);
      return [];
    }
  };

  const fetchlambdaMemoryUnderprovisionedData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getlambdaMemoryUnderprovisioned?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching lambda Memory Underprovisioned data:", err);
      return [];
    }
  };

  const fetchEbsVolumesRecomData = async (accountId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}recommendation/getEbsVolumesRecom?accountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_SECRET_TOKEN}`,
          },
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching Ebs Volumes data:", err);
      return [];
    }
  };

  const handleAccordionChange = async (accountId) => {
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
      return;
    }
    setExpandedAccount(accountId);
    setLoading(true);
    setServiceLoading(prev => ({
      ...prev,
      ec2: true,
      ebs: true,
      snapshot: true,
      volumeSnapshot: true,
      rds: true,
      ec2Weekends: true,
      elasticIp: true,
      underutilisedEc2: true,
      underutilisedRds: true,
      s3: true,
      lambdaRightSizing: true,
      lambdaUnderprovisioned: true,
      ebsVolumesRecom: true
    }));

    try {
      const [
        ec2Results,
        ebsResults,
        snapshotResults,
        volumeSnapshotResults,
        rdsResults,
        ec2WeekendsResults,
        elasticIpResults,
        underutilisedEc2Results,
        underutilisedRdsResults,
        s3Results,
        lambdaRightSizingResults,
        lambdaUnderprovisionedResults,
        ebsVolumesRecomResults
      ] = await Promise.all([
        !ec2Data[accountId] ? fetchEc2Data(accountId).catch(err => ({ error: err, type: 'ec2' })) : Promise.resolve(ec2Data[accountId]),
        !ebsData[accountId] ? fetchEbsData(accountId).catch(err => ({ error: err, type: 'ebs' })) : Promise.resolve(ebsData[accountId]),
        !snapshotData[accountId] ? fetchLatestSnapshotData(accountId).catch(err => ({ error: err, type: 'snapshot' })) : Promise.resolve(snapshotData[accountId]),
        !volumeSnapshotData[accountId] ? fetchAvailableVolumeRecommendedSnapshotData(accountId).catch(err => ({ error: err, type: 'volumeSnapshot' })) : Promise.resolve(volumeSnapshotData[accountId]),
        !rdsWeekendsData[accountId] ? fetchRDSinstancesData(accountId).catch(err => ({ error: err, type: 'rds' })) : Promise.resolve(rdsWeekendsData[accountId]),
        !ec2WeekendsData[accountId] ? fetchEC2instancesData(accountId).catch(err => ({ error: err, type: 'ec2Weekends' })) : Promise.resolve(ec2WeekendsData[accountId]),
        !unattachedElasticipData[accountId] ? fetchUnattachedElasticipData(accountId).catch(err => ({ error: err, type: 'elasticIp' })) : Promise.resolve(unattachedElasticipData[accountId]),
        !underutilisedEc2Data[accountId] ? fetchUnderutilisedEc2Data(accountId).catch(err => ({ error: err, type: 'underutilisedEc2' })) : Promise.resolve(underutilisedEc2Data[accountId]),
        !underutilisedRdsData[accountId] ? fetchUnderutilisedRdsData(accountId).catch(err => ({ error: err, type: 'underutilisedRds' })) : Promise.resolve(underutilisedRdsData[accountId]),
        !s3MultipartUploadData[accountId] ? fetchS3MultipartUploadData(accountId).catch(err => ({ error: err, type: 's3' })) : Promise.resolve(s3MultipartUploadData[accountId]),
        !lambdaMemoryRightSizing[accountId] ? fetchlambdaMemoryRightSizingData(accountId).catch(err => ({ error: err, type: 'lambdaRightSizing' })) : Promise.resolve(lambdaMemoryRightSizing[accountId]),
        !lambdaMemoryRightUnderprovisioned[accountId] ? fetchlambdaMemoryUnderprovisionedData(accountId).catch(err => ({ error: err, type: 'lambdaUnderprovisioned' })) : Promise.resolve(lambdaMemoryRightUnderprovisioned[accountId]),
        !ebsVolumesRecom[accountId] ? fetchEbsVolumesRecomData(accountId).catch(err => ({ error: err, type: 'ebsVolumesRecom' })) : Promise.resolve(ebsVolumesRecom[accountId])
      ]);

      const processResult = (result, stateUpdater, type) => {
        if (result && result.error) {
          console.error(`Error fetching ${type} data:`, result.error);
          toast.error(`Failed to load ${type} recommendations`);
        } else if (result) {
          stateUpdater(prev => ({ ...prev, [accountId]: result }));
        }
      };

      processResult(ec2Results, setEc2Data, 'EC2');
      processResult(ebsResults, setEbsData, 'EBS');
      processResult(snapshotResults, setSnapshotData, 'Snapshot');
      processResult(volumeSnapshotResults, setVolumeSnapshotData, 'Volume Snapshot');
      processResult(rdsResults, setRdsWeekendsData, 'RDS');
      processResult(ec2WeekendsResults, setEc2WeekendsData, 'EC2 Weekends');
      processResult(elasticIpResults, setUnattachedElasticipData, 'Elastic IP');
      processResult(underutilisedEc2Results, setUnderutilisedEc2Data, 'Underutilised EC2');
      processResult(underutilisedRdsResults, setUnderutilisedRdsData, 'Underutilised RDS');
      processResult(s3Results, setS3MultipartUploadData, 'S3');
      processResult(lambdaRightSizingResults, setLambdaMemoryRightSizing, 'Lambda Right Sizing');
      processResult(lambdaUnderprovisionedResults, setLambdaMemoryRightUnderprovisioned, 'Lambda Underprovisioned');
      processResult(ebsVolumesRecomResults, setEbsVolumesRecom, 'EBS Volumes');

    } catch (error) {
      console.error('Error in concurrent API calls:', error);
      toast.error('Some recommendations failed to load. Please try again.');
    } finally {
      setServiceLoading(prev => ({
        ...prev,
        ec2: false,
        ebs: false,
        snapshot: false,
        volumeSnapshot: false,
        rds: false,
        ec2Weekends: false,
        elasticIp: false,
        underutilisedEc2: false,
        underutilisedRds: false,
        s3: false,
        lambdaRightSizing: false,
        lambdaUnderprovisioned: false,
        ebsVolumesRecom: false
      }));
      setLoading(false);
    }
  };

  const renderEc2Table = (ec2Data) => {
    // Check if data is available
    if (!ec2Data || ec2Data.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const oldTotalCost = ec2Data
      .reduce((sum, instance) => sum + parseFloat(instance.old_cost), 0)
      .toFixed(2);
    const newTotalCost = ec2Data
      .reduce((sum, instance) => sum + parseFloat(instance.new_cost), 0)
      .toFixed(2);

    return (
      <>
        {/* <TreeDataWithGap /> */}
        <Typography variant="h5">
          Old vs New Generation Configuration Comparison
        </Typography>

        <div className="table-container">
          {/* Old Instances Table */}
          <TableContainer component={Paper} className="table old-table">
            <Typography variant="h6" align="center">
              Old Instances
            </Typography>
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Instance ID</TableCell>
                  <TableCell className="table-header">
                    Instance Details
                  </TableCell>
                  <TableCell className="table-header">
                    Cost/Month (USD)
                  </TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {ec2Data.map((instance, index) => (
                  <TableRow>
                    <TableCell>{instance.instance_id}</TableCell>
                    <TableCell>
                      {instance.old_instance_type}
                      <div className="instance-details">
                        {instance.old_vCPU} CPU, {instance.old_memory}
                      </div>
                    </TableCell>
                    <TableCell>
                      {parseFloat(instance.old_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer */}
              <TableBody>
                <TableRow className="old-instance-total">
                  <TableCell colSpan={2} className="table-total">
                    Current Cluster Cost:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${oldTotalCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* New Instances Table */}
          <TableContainer component={Paper} className="table new-table">
            <Typography variant="h6" align="center">
              New Instances
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Instance ID</TableCell>
                  <TableCell className="table-header">
                    Instance Details
                  </TableCell>
                  <TableCell className="table-header">
                    Cost/Month (USD)
                  </TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ec2Data.map((instance, index) => (
                  <TableRow>
                    <TableCell>{instance.instance_id}</TableCell>
                    <TableCell>
                      {instance.new_instance_type}
                      <div className="instance-details">
                        {instance.new_vCPU} CPU, {instance.new_memory}
                      </div>
                    </TableCell>
                    <TableCell>
                      {parseFloat(instance.new_cost).toFixed(2)}
                    </TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => modifyEC2Instance(instance, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={3} className="table-total">
                    Optimized Cluster Cost:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${newTotalCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderEbsTables = (ebsData) => {
    // Check if data is available
    if (!ebsData || ebsData.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const oldTotalCost = ebsData
      .reduce(
        (sum, volume) => sum + parseFloat([volume["Current Monthly Cost"]]),
        0
      )
      .toFixed(2);
    const newTotalCost = ebsData
      .reduce(
        (sum, volume) => sum + parseFloat(volume["Recommended Monthly Cost"]),
        0
      )
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          GP2 vs GP3 Configuration Comparison
        </Typography>
        <div className="table-container">
          {/* Old Instances Table */}
          <TableContainer component={Paper} className="table old-table">
            <Typography variant="h6" align="center">
              Current Configurations
            </Typography>
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">EBS Volume ID</TableCell>
                  <TableCell className="table-header">Volume Type</TableCell>
                  <TableCell className="table-header">
                    Cost/Month (USD)
                  </TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {ebsData.map((volume, index) => (
                  <TableRow key={index}>
                    <TableCell>{volume["EBS Volume ID"]}</TableCell>
                    <TableCell>{volume["Current Volume Type"]}</TableCell>
                    <TableCell>
                      {parseFloat(volume["Current Monthly Cost"]).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer */}
              <TableBody>
                <TableRow className="old-instance-total">
                  <TableCell colSpan={2} className="table-total">
                    Current Cluster Cost:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${oldTotalCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* New Instances Table */}
          <TableContainer component={Paper} className="table new-table">
            <Typography variant="h6" align="center">
              Recommended Configurations
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">EBS Volume ID</TableCell>
                  <TableCell className="table-header">Volume Type</TableCell>
                  <TableCell className="table-header">
                    Cost/Month (USD)
                  </TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ebsData.map((volume, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ width: "17" }}>{volume["EBS Volume ID"]}</TableCell>
                    <TableCell>{volume["Recommended Volume Type"]}</TableCell>
                    <TableCell>{volume["Recommended Monthly Cost"]}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => modifyVolume(volume, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={3} className="table-total">
                    Optimized Cluster Cost:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${newTotalCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderLatestSnapshotTables = (snapshotData) => {
    // Check if data is available
    if (!snapshotData || snapshotData.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsTotalCost = snapshotData
      .reduce((sum, volume) => sum + parseFloat([volume["Savings"]]), 0)
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          Consolidate incremental snapshots into a single snapshot
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">EBS Volume ID</TableCell>
                  <TableCell className="table-header">Volume State</TableCell>
                  <TableCell className="table-header"># Snapshots</TableCell>
                  <TableCell className="table-header">
                    Latest Snapshot ID
                  </TableCell>
                  <TableCell className="table-header">
                    Savings/Month (USD)
                  </TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {snapshotData.map((volume, index) => (
                  <TableRow key={index}>
                    <TableCell>{volume["EBS Volume ID"]}</TableCell>
                    <TableCell>{volume["Volume State"]}</TableCell>
                    <TableCell>{volume["Number of Snapshots"]}</TableCell>
                    <TableCell>{volume["Latest Snapshot ID"]}</TableCell>
                    <TableCell>
                      {parseFloat(volume["Savings"]).toFixed(2)}
                    </TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => deleteSnapshot(volume, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={5} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsTotalCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderVolumeSnapshotTables = (volumeSnapshotData) => {
    // Check if data is available
    if (!volumeSnapshotData || volumeSnapshotData.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = volumeSnapshotData
      .reduce((sum, volume) => sum + parseFloat([volume["Savings"]]), 0)
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          Available volumes Recommended Snapshots
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">EBS Volume ID</TableCell>
                  <TableCell className="table-header">Volume State</TableCell>
                  <TableCell className="table-header">
                    Monthly Cost (USD)
                  </TableCell>
                  <TableCell className="table-header">
                    Snapshot Cost (USD)
                  </TableCell>
                  <TableCell className="table-header">
                    Savings/Month (USD)
                  </TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {volumeSnapshotData.map((volume, index) => (
                  <TableRow key={index}>
                    <TableCell>{volume["EBS Volume ID"]}</TableCell>
                    <TableCell>{volume["Volume State"]}</TableCell>
                    <TableCell>{volume["Monthly Cost"]}</TableCell>
                    <TableCell>{volume["Snapshot Cost"]}</TableCell>
                    <TableCell>{volume["Savings"]}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => convertVolumeToSnapshot(volume, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={5} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderRdsWeekendsTables = (rdsWeekendsData) => {
    // Check if data is available
    if (!rdsWeekendsData || !rdsWeekendsData.RDSDetails || rdsWeekendsData.RDSDetails.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = rdsWeekendsData.RDSDetails
      .reduce((sum, rds) => sum + parseFloat([rds["TotalWeekendCost"]]), 0)
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          RDS Instances Weekends STOP Recommedation
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">DB Identifier</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Engine</TableCell>
                  <TableCell className="table-header">DB Instance Class</TableCell>
                  <TableCell className="table-header">Weekends Cost (USD)</TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {rdsWeekendsData.RDSDetails.map((rds, index) => (
                  <TableRow key={index}>
                    <TableCell>{rds.DBInstanceIdentifier}</TableCell>
                    <TableCell>{rds.Region}</TableCell>
                    <TableCell>{rds.Engine}</TableCell>
                    <TableCell>{rds.DBInstanceClass}</TableCell>
                    <TableCell>{parseFloat(rds.TotalWeekendCost).toFixed(2)}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => rdsStopStart(rds, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={5} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost * 4}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderEc2WeekendsTables = (ec2WeekendsData) => {
    // Check if data is available
    if (!ec2WeekendsData || !ec2WeekendsData.EC2Details || ec2WeekendsData.EC2Details.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = ec2WeekendsData.EC2Details
      .reduce((sum, ec2) => sum + parseFloat([ec2["TotalWeekendCost"]]), 0)
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          EC2 Instances Weekends STOP Recommedation
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">InstanceId</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">State</TableCell>
                  <TableCell className="table-header">InstanceType</TableCell>
                  <TableCell className="table-header">Weekends Cost (USD)</TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {ec2WeekendsData.EC2Details.map((ec2, index) => (
                  <TableRow key={index}>
                    <TableCell>{ec2.InstanceId}</TableCell>
                    <TableCell>{ec2.Region}</TableCell>
                    <TableCell>{ec2.State}</TableCell>
                    <TableCell>{ec2.InstanceType}</TableCell>
                    <TableCell>{parseFloat(ec2.TotalWeekendCost).toFixed(2)}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => ec2StopStart(ec2, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={5} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost * 4}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderUnattachedElsaticIpTables = (unattachedElasticipData) => {
    // Check if data is available
    if (!unattachedElasticipData || unattachedElasticipData.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = (unattachedElasticipData.length) * 3.6

    return (
      <>
        <Typography variant="h5">
          Unattached Elastic Ip Addresses
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">IP Address</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Savings/Month (USD)</TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {unattachedElasticipData.map((ip, index) => (
                  <TableRow key={index}>
                    <TableCell>{ip.ip_address}</TableCell>
                    <TableCell>{ip.region}</TableCell>
                    <TableCell>3.6</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => unattachElasticip(ip.ip_address, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={3} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderUnderutilisedEc2Tables = (underutilisedEc2Data) => {
    // Check if data is available
    if (!underutilisedEc2Data || underutilisedEc2Data.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = underutilisedEc2Data
      .reduce((sum, instance) => sum + parseFloat([instance["Savings"]]), 0)
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          Underutilised EC2 Instances
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Instance Id</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Current Instance Type</TableCell>
                  <TableCell className="table-header">Recommended Instance Type</TableCell>
                  <TableCell className="table-header">Savings/Month (USD)</TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {underutilisedEc2Data.map((instance, index) => (
                  <TableRow key={index}>
                    <TableCell>{instance.InstanceId}</TableCell>
                    <TableCell>{instance.Region}</TableCell>
                    <TableCell>{instance.CurrentInstanceType}</TableCell>
                    <TableCell>{instance.RecommendedInstanceType}</TableCell>
                    <TableCell>{instance.Savings}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => underutilisedEc2(instance, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={5} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderUnderutilisedRdsTables = (underutilisedRdsData) => {
    // Check if data is available
    if (!underutilisedRdsData || underutilisedRdsData.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = underutilisedRdsData
      .reduce((sum, instance) => sum + parseFloat([instance["Savings (USD/Month)"]]), 0)
      .toFixed(2);

    return (
      <>
        <Typography variant="h5">
          Underutilised RDS Instances
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Instance Id</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Current Instance Type</TableCell>
                  <TableCell className="table-header">Recommended Instance Type</TableCell>
                  <TableCell className="table-header">Savings/Month (USD)</TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {underutilisedRdsData.map((instance, index) => (
                  <TableRow key={index}>
                    <TableCell>{instance.DBInstanceIdentifier}</TableCell>
                    <TableCell>{instance.Region}</TableCell>
                    <TableCell>{instance.CurrentInstanceClass}</TableCell>
                    <TableCell>{instance.RecommendedInstanceClass}</TableCell>
                    <TableCell>{instance["Savings (USD/Month)"]}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => underutilisedRds(instance, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={5} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderS3MultipartUplaodTables = (s3MultipartUploadData) => {
    // Check if data is available
    if (!s3MultipartUploadData || s3MultipartUploadData.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    const savingsCost = parseFloat(s3MultipartUploadData?.reduce((sum, s3) => sum + parseFloat([s3["totalSavings"]]), 0).toFixed(2)) || 0;
    return (
      <>
        <Typography variant="h5">
          S3 Buckets Multipart Upload Abort
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Bucket Name</TableCell>
                  <TableCell className="table-header">Total Size (GB)</TableCell>
                  <TableCell className="table-header">Savings/Month (USD)</TableCell>
                  <TableCell className="table-header"></TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {s3MultipartUploadData.map((s3, index) => (
                  <TableRow key={index}>
                    <TableCell>{s3.Bucket}</TableCell>
                    <TableCell>{s3.totalSize}</TableCell>
                    <TableCell>{s3.totalSavings}</TableCell>
                    <TableCell><Button style={{ height: "17px" }} onClick={() => s3MultipartUpload(s3, expandedAccount)} disabled={loading}>Apply</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Table Footer   */}
              <TableBody>
                <TableRow className="new-instance-total">
                  <TableCell colSpan={3} className="table-total">
                    Total Savings:
                  </TableCell>
                  <TableCell className="table-total-cost">
                    ${savingsCost}/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderLambdaMemoryRightSizingables = (lambdaMemoryRightSizing) => {
    // Check if data is available
    if (!lambdaMemoryRightSizing || lambdaMemoryRightSizing.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    return (
      <>
        <Typography variant="h5">
          Lambda Memory RightSizing
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Function Name</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Current Memory</TableCell>
                  <TableCell className="table-header">Recommended Memory</TableCell>
                  <TableCell className="table-header">Current Cost Per Invocation</TableCell>
                  <TableCell className="table-header">Recommended Cost Per Invocation</TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {lambdaMemoryRightSizing.map((lambda, index) => (
                  <TableRow key={index}>
                    <TableCell>{lambda.FunctionName}</TableCell>
                    <TableCell>{lambda.Region}</TableCell>
                    <TableCell>{lambda.CurrentMemory}</TableCell>
                    <TableCell>{lambda.RecommendedMemory}</TableCell>
                    <TableCell>{lambda.CurrentCostPerInvocation}</TableCell>
                    <TableCell>{lambda.RecommendedCostPerInvocation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderLambdaMemoryUnderprovisionedTables = (lambdaMemoryRightUnderprovisioned) => {
    // Check if data is available
    if (!lambdaMemoryRightUnderprovisioned || lambdaMemoryRightUnderprovisioned.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    return (
      <>
        <Typography variant="h5">
          Lambda Memory Underprovisioned
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Function Name</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Current Memory</TableCell>
                  <TableCell className="table-header">Recommended Memory</TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {lambdaMemoryRightUnderprovisioned.map((lambda, index) => (
                  <TableRow key={index}>
                    <TableCell>{lambda.functionName}</TableCell>
                    <TableCell>{lambda.region}</TableCell>
                    <TableCell>{lambda.currentMemorySize}</TableCell>
                    <TableCell>{lambda.recommendedMemoryIncrease}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const renderEbsVolumesRecomTables = (ebsVolumesRecom) => {
    // Check if data is available
    if (!ebsVolumesRecom || ebsVolumesRecom.length === 0) {
      return <Typography variant="body1"></Typography>;
    }

    return (
      <>
        <Typography variant="h5">
          EBS Volume Recommendations
        </Typography>
        <div className="table-container">
          <TableContainer component={Paper} className="table-full">
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">Volume Id</TableCell>
                  <TableCell className="table-header">Region</TableCell>
                  <TableCell className="table-header">Recommedation</TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {ebsVolumesRecom.map((ebs, index) => (
                  <TableRow key={index}>
                    <TableCell>{ebs.VolumeId}</TableCell>
                    <TableCell>{ebs.Region}</TableCell>
                    <TableCell>{ebs.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </>
    );
  };

  const CostSummaryCards = () => {

    const curr1 = parseFloat(ec2Data[expandedAccount]?.reduce((sum, instance) => sum + parseFloat(instance.old_cost), 0).toFixed(2)) || 0;
    const recom1 = parseFloat(ec2Data[expandedAccount]?.reduce((sum, instance) => sum + parseFloat(instance.new_cost), 0).toFixed(2)) || 0;
    const curr2 = parseFloat(ebsData[expandedAccount]?.reduce((sum, volume) => sum + parseFloat([volume["Current Monthly Cost"]]), 0).toFixed(2)) || 0;
    const recom2 = parseFloat(ebsData[expandedAccount]?.reduce((sum, volume) => sum + parseFloat([volume["Current Monthly Cost"]]), 0).toFixed(2)) || 0;
    const curr3 = parseFloat(snapshotData[expandedAccount]?.reduce((sum, volume) => sum + parseFloat([volume["Savings"]]), 0).toFixed(2)) || 0;
    const curr4 = parseFloat(volumeSnapshotData[expandedAccount]?.reduce((sum, volume) => sum + parseFloat([volume["Savings"]]), 0).toFixed(2)) || 0;
    const curr5 = parseFloat(rdsWeekendsData[expandedAccount]?.RDSDetails.reduce((sum, rds) => sum + parseFloat([rds["TotalWeekendCost"]]), 0).toFixed(2)) || 0;
    const curr6 = (unattachedElasticipData[expandedAccount]?.length) * 3.6;
    const curr7 = parseFloat(underutilisedEc2Data[expandedAccount]?.reduce((sum, instance) => sum + parseFloat([instance.Savings]), 0).toFixed(2)) || 0;
    const curr8 = parseFloat(underutilisedRdsData[expandedAccount]?.reduce((sum, instance) => sum + parseFloat([instance["Savings (USD/Month)"]]), 0).toFixed(2)) || 0;
    const curr9 = parseFloat(ec2WeekendsData[expandedAccount]?.EC2Details.reduce((sum, ec2) => sum + parseFloat([ec2["TotalWeekendCost"]]), 0).toFixed(2)) || 0;
    const curr10 = parseFloat(s3MultipartUploadData[expandedAccount]?.reduce((sum, s3) => sum + parseFloat([s3["totalSavings"]]), 0).toFixed(2)) || 0;
    const curr = (parseFloat((curr1 + curr2 + curr3 + curr4 + (curr5 * 4) + curr6 + curr7 + curr8 + (curr9 * 4)) + curr10).toFixed(2)) || 0;
    const recom = (parseFloat(recom1 + recom2).toFixed(2)) || 0;
    const saving = (parseFloat(curr - recom).toFixed(2)) || 0;
    return (
      <Grid container spacing={3} sx={{ marginTop: 1, marginBottom: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: 'rgb(221, 231, 245)' }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Current Cost/Month
              </Typography>
              <Typography variant="h4">${curr}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#adece5' }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Recommended Cost/Month
              </Typography>
              <Typography variant="h4">${recom}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: 'rgb(217, 244, 217)' }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Savings/Month
              </Typography>
              <Typography variant="h4">${saving}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container>
      {!Object.values(serviceLoading).some((isLoading) => isLoading) && !expandedAccount && loading && !accounts.length && (
      <div className="loader-container" style={{ marginTop: '0px' }}>
        <BarLoader width="100%" color={"#EB5A3C"} />
      </div>
      )}
      <Typography variant="h4" gutterBottom>
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {accounts.map((account) => (
      <Accordion 
        key={account}
        expanded={expandedAccount === account}
        onChange={() => {
        handleAccordionChange(account);
        }}
        disabled={Object.values(serviceLoading).some((isLoading) => isLoading)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{`${account}`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
        {expandedAccount === account && (
          <div style={{ pointerEvents: Object.values(serviceLoading).some((isLoading) => isLoading) ? 'none' : 'auto', 
                 opacity: Object.values(serviceLoading).some((isLoading) => isLoading) ? 0.5 : 1 }}>
          {CostSummaryCards()}
          {serviceLoading.ec2 && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderEc2Table(ec2Data[account])}
          {serviceLoading.ebs && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderEbsTables(ebsData[account])}
          {serviceLoading.snapshot && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderLatestSnapshotTables(snapshotData[account])}
          {serviceLoading.volumeSnapshot && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderVolumeSnapshotTables(volumeSnapshotData[account])}
          {serviceLoading.rds && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderRdsWeekendsTables(rdsWeekendsData[account])}
          {serviceLoading.ec2Weekends && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderEc2WeekendsTables(ec2WeekendsData[account])}
          {serviceLoading.elasticIp && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderUnattachedElsaticIpTables(unattachedElasticipData[account])}
          {serviceLoading.underutilisedEc2 && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderUnderutilisedEc2Tables(underutilisedEc2Data[account])}
          {serviceLoading.underutilisedRds && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderUnderutilisedRdsTables(underutilisedRdsData[account])}
          {serviceLoading.s3 && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderS3MultipartUplaodTables(s3MultipartUploadData[account])}
          {serviceLoading.lambdaRightSizing && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderLambdaMemoryRightSizingables(lambdaMemoryRightSizing[account])}
          {serviceLoading.lambdaUnderprovisioned && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderLambdaMemoryUnderprovisionedTables(lambdaMemoryRightUnderprovisioned[account])}
          {serviceLoading.ebsVolumesRecom && <BarLoader width="100%" color={"#EB5A3C"} />}
          {renderEbsVolumesRecomTables(ebsVolumesRecom[account])}
          </div>
        )}
        </AccordionDetails>
      </Accordion>
      ))}
    </Container>
    );
};

export default Ec2Recommendation;

