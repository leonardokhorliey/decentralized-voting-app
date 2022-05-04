import { useState } from 'react';
import VotingPage from './VotingPage';
import Web3 from 'web3/dist/web3.min.js';

const AdminPage = ({contract, startVote, endVote, accountType, address, enableContract, disableContract, contractLive, electionPhase_, candidates, posts, sendCandidatesData, setPage}) => {

    const [newAdmin, setNewAdmin] = useState('')
    const [newChairman, setNewChairman] = useState('')
    const [position, setPosition] = useState('')
    const [electionPhase, setElectionPhase] = useState(electionPhase_)
    const [posts_, setPosts_] = useState(posts)

    
    const [currentView, setCurrentView] = useState(contractLive ? 0 : 4)
    const [file, setFile] = useState()
    const [accountType_, setAccountType_] = useState('')
    const fileReader = new FileReader();
    const views = ['Whitelisting', `${electionPhase < 5 ? 'View Candidates' : 'View Results'}`, 'Vote Administration', 'Hand Over', 'Advanced'];

    console.log(Web3.utils.fromAscii('20110529'));
    const handleStartVote = () => {
        if (candidates.length === 0) {
            alert('Voting can not start without candidates')
        }
        startVote();
    }

    const handleEndVote = () => {
        endVote();
    }


    const changeChairman = async () => {
        try {
            await contract.methods.setChairman(newChairman).send({from: address})
            alert("Chairman changed. You would have to log in again")
            setPage('login')
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
        }
    }

    const refreshContract = async () => {
        try {
            await contract.methods.clearData().send({from: address})
            alert("Contract Data refreshed")
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
        } 
    }

    const getType = async () => {
        if(!newAdmin) {alert('Enter a valid address'); return;}
        try {
            const res = await contract.methods.login(newAdmin).call()
            setAccountType_(res);
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
        } 
    }


    const handleAddStakeholders = async (e) => {
        e.preventDefault();

        let res = [];
        let roles = [];
        if (file) {
            fileReader.onload = async function (event) {
                const csvOutput = event.target.result;
                let lines = csvOutput.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    let p = lines[i].split(',');
                    if (p[0]) res.push(p[0]);
                    if (p[1]) roles.push(p[1].split('\r')[0]);
        
                }
        
                console.log({res, roles})

                if (res.length === roles.length && res.length > 0) {
                    try {
                        await contract.methods.addStakeholders(res, roles).send({from : address})
                        alert('Added Stakeholders');
                    } 
                    catch (error) {
                        const p = {error}
			            alert(p.error.message);
                    } 
                } else alert("The number of addresses you sent do not match the number of roles. Check your file and try again.")

            };
            fileReader.readAsText(file);
        } 
    }

    const handleStartDeclaration = async () => {
        if (electionPhase > 0) {
            alert('You can not start Interest Declaration now. Election has gone beyond this phase');
            return;
        }

        try {
            await contract.methods.startDeclaration().send({from : address})
            setElectionPhase(1);
            console.log('Started Declare');
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
		} 
    }

    const handleEndDeclaration = async () => {
        if (electionPhase > 1) {
            alert('You can not start Interest Declaration now. Election has gone beyond this phase');
            return;
        }
        if (electionPhase < 1) {
            alert('You have not started interest declaration yet, so it can not be ended.');
            return;
        }

        try {
            await contract.methods.endDeclaration().send({from : address})
            setElectionPhase(2);
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
		} 
        
    }

    const handleCreatePost = async () => {
        if (electionPhase > 0) {
            alert('You can not create a post after election period has been started. Election has gone beyond this phase');
            return;
        }

        let p = position.split(',').map((post) => {
            let trimmed = post.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        })

        try {
            await contract.methods.createPosition(p).send({from : address})
            alert('Posts Created');	
            setPosts_(p)
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
		} 
    }

    const handlePublishResults = async () => {
        try {
            await contract.methods.publicResults(0x3230313530363237000000000000000000000000000000000000000000000000).send({from : address})
            alert('Results set to Published');	
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
		} 
    }


    return (
        <>
        {/* {contractLive && (<>{votingOccuring && candidates.length !== 0 && <button onClick= {() => setViewCandidates(!viewCandidates)} 
        className = "side-button"> {viewCandidates ? 'Back to Admin' : 'View Candidates'}</button>}</>)} */}
        {contractLive && <div className= "admin-page">
            <div className= 'admin-sidebar'>
                <div className="admin-menu">
                    {views.map((view, idx) => {
                        if (accountType !== 'Chairman' && ![0, 1].includes(idx)) return <></>;
                        return (
                            <div key= {idx} className= {`admin-menu-item ${currentView === idx && 'item-select'}`} onClick= {() => setCurrentView(idx)}>
                                {view}
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {currentView === 2 &&
            <div className= "admin-page-info">
                <div className= "admin-page">
                    <div className= "admin-page-info">

                        {electionPhase < 2 && <>
                        <h3>Interest Declaration</h3>
                        <div className= "start-and-end-vote">
                            <button className= "start-vote" onClick= {handleStartDeclaration}>
                                Start Interest Declaration
                            </button>
                            <button className= "end-vote" onClick= {handleEndDeclaration}>
                                End Interest Declaration
                            </button>
                        </div></>}

                        <h3>Voting Adjustment</h3>
                        <div className= "start-and-end-vote">
                            <button className= "start-vote" onClick= {handleStartVote}>
                                Start Vote
                            </button>
                            <button className= "end-vote" onClick= {handleEndVote}>
                                End Vote
                            </button>
                        </div>
                        <h3>{' '}</h3>
                        <hr/>

                        {electionPhase === 4 && <button onClick= {handlePublishResults}> Publish Results</button>}
                    </div>
                    

                    <div className= "posts-view">
                        <h3>
                        Create New Post
                        </h3>
                        <div className= "start-and-end-vote">
                            <input type= 'text' placeholder= 'Enter post title' value = {position} onChange= {(e) => setPosition(e.target.value)} />
                            <button onClick = {handleCreatePost}> Create</button>
                        </div>

                        {posts.length > 0 ? <><h3>Posts Available</h3>
                        <ul className= "post-list">
                            {posts_.map((post, idx) => <li key= {idx} className= "post-list-item">{post}</li>)}
                        </ul></> : <h3>No Post Created Yet for Election</h3>}
                    </div>
                    
                </div>
                
            </div>}

            {currentView === 1 &&
                <div className= "admin-page-info">
                <VotingPage posts= {posts} candidatesByPost= {candidates} isAdminView= {true} accountType = {accountType} isResultView= {electionPhase === 5} electionPhase = {electionPhase} contract = {contract} address= {address}/>
                </div>
            }
            
            {currentView === 0 &&
            <div className= "admin-page-info">

                {['Chairman'].includes(accountType) && <>
                <h3> WhiteList Addresses </h3>
                <input type = "file" onChange = {(e) => setFile(e.target.files[0])} />
                <button onClick = {(e) => handleAddStakeholders(e)}>Add Stakeholders</button>
                <hr />

                
                </>}


                <h3>
                    Check Account Type
                </h3>
                <div className= "start-and-end-vote">
                    <input type= 'text' placeholder= 'Enter Address' value = {newAdmin} onChange= {(e) => setNewAdmin(e.target.value)} />
                    <button onClick = {getType}> Check</button>
                </div>
                <div className= "account-type" >{accountType_}</div>
                <hr/>
                
            </div>}
            


            {currentView === 4 &&
            <div className= "admin-page-info">

                <h3>Contract Availability</h3>
                <div className= "start-and-end-vote">
                    <button className= "start-vote" onClick= {enableContract}>
                        Enable Contract
                    </button>
                    <button className= "end-vote" onClick= {disableContract}>
                        Disable Contract
                    </button>
                </div>
                <hr />

                <h3> Refresh Contract </h3>
                <button onClick = {refreshContract}>Refresh Contract Data</button>
                <hr />
            </div>}
            
            {currentView === 3 &&
            <div className= "admin-page-info">
                <h3>
                    Change Chairman
                </h3>
                <div className= "start-and-end-vote">
                    <input type= 'text' placeholder= 'Enter Address' value = {newChairman} onChange= {(e) => setNewChairman(e.target.value)} />
                    <button onClick = {changeChairman}> Hand Over</button>
                </div>
            </div>}
            

            

            
            
        </div>}
        {!contractLive && <><p>Contract is not enabled at the moment. Please enable contract first or contact Chairman</p>

        {accountType = 'Chairman' && <><h3>Contract Availability</h3>
        <div className= "start-and-end-vote">
            <button className= "start-vote" onClick= {enableContract}>
                Enable Contract
            </button>
            <button className= "end-vote" onClick= {disableContract}>
                Disable Contract
            </button>
        </div>
        <hr />

        <h3> Refresh Contract </h3>
        <button onClick = {refreshContract}>Refresh Contract Data</button></>}</>}

        </>
    )
}

export default AdminPage