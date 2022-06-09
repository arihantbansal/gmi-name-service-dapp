import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import polygonLogo from "./assets/polygonlogo.png";
import ethLogo from "./assets/ethlogo.png";
import { networks } from "./utils/networks";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import contractAbi from "./utils/contractABI.json";

const TWITTER_HANDLE = "_arihantbansal";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const tld = ".gmi";
const CONTRACT_ADDRESS = "0x934333c64FaCa3bFA87fB7a9863dc18A4D6e5B3C";

const App = () => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [domain, setDomain] = useState("");
	const [record, setRecord] = useState("");
	const [network, setNetwork] = useState("");

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}

		const chainId = await ethereum.request({ method: "eth_chainId" });
		setNetwork(networks[chainId]);

		ethereum.on("chainChanged", handleChainChanged);

		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	};

	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img
				src="https://media.giphy.com/media/CSbIZi52DvqnJPm1WA/giphy.gif"
				alt="unicorn gif"
			/>
			<button
				onClick={connectWallet}
				className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

	const mintDomain = async () => {
		if (!domain) {
			return;
		}
		if (domain.length < 3) {
			alert("Domain must be at least 3 characters long");
			return;
		}

		const price =
			domain.length === 3 ? "0.05" : domain.length === 4 ? "0.03" : "0.01";
		console.log("Minting domain", domain, "with price", price);

		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractAbi.abi,
					signer
				);

				console.log("Going to pop wallet now to pay gas...");
				let tx = await contract.register(domain, {
					value: ethers.utils.parseEther(price),
				});
				const receipt = await tx.wait();

				if (receipt.status === 1) {
					console.log(
						"Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
					);

					tx = await contract.setRecord(domain, record);
					await tx.wait();

					console.log(
						"Record set! https://mumbai.polygonscan.com/tx/" + tx.hash
					);

					setRecord("");
					setDomain("");
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const renderInputForm = () => {
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder="domain"
						onChange={(e) => setDomain(e.target.value)}
					/>
					<p className="tld"> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder="why are you gmi"
					onChange={(e) => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button className="cta-button mint-button" onClick={mintDomain}>
						Mint
					</button>
				</div>
			</div>
		);
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">🌈🚀 GMI Name Service</p>
							<p className="subtitle">Your wholesome API on the blockchain!</p>
						</div>
						<div className="right">
							<img
								alt="Network logo"
								className="logo"
								src={network.includes("Polygon") ? polygonLogo : ethLogo}
							/>
							{currentAccount ? (
								<p>
									{" "}
									Wallet: {currentAccount.slice(0, 6)}...
									{currentAccount.slice(-4)}{" "}
								</p>
							) : (
								<p> Not connected </p>
							)}
						</div>
					</header>
				</div>

				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}

				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer">{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
