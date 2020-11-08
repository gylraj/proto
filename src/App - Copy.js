import logo from './logo.svg';
import React, {Component, useState, useEffect} from 'react';
import Home from './components/Home'
import './App.css';

//socket io client
import socketIOClient from "socket.io-client";
//socket io endpoint - to be declared as env var
const ENDPOINT = "https://gylsio.herokuapp.com";


class App extends Component {

  // init constructor
  constructor(props){
    super(props);
    this.state = {
      title: 'Gyl Sample',
      act:0,
      index:'',
      datas:[],
      response:{},
      username:'',
      messages:[],
      users:[]
    }
    //connecting to socket
    this.state.socket = socketIOClient(ENDPOINT,  {transports: ['websocket']});
  }

  //onload component 
 componentDidMount(){
   this.refs.name.focus();

    this.state.socket.on("connect", this.onConnect);
    this.state.socket.on("disconnect", this.onDisconnect);
    // this.state.socket.on("user disconnected", this.onUserDisconnected);


    //this.state.socket.emit("new user","test",this.onEmit);

    //recv new user
    this.state.socket.on("new user", this.onNewUser);
    //recv chat
    this.state.socket.on("chat message", this.onChatMessage);

 }
  //recv chat callback
  onChatMessage = resp => {
    console.log('onChatMessage');
    console.log(resp);
    this.state.messages.push(resp);
    console.log(this.state.messages);
    this.setState({
      'messages': this.state.messages,
    });
    console.log(this.state.messages);
  };
  //recv chat callback
  onNewUser = newUser => {
    //array string newUser
    console.log('onNewUser');
    console.log(newUser);
    this.setState({
      'users': newUser,
    });
    console.log(this.state.users)
  };




  onConnect = r  => {
    console.log('onConnect');
    console.log(this.state.socket);
  };

  onDisconnect = r  => {
    console.log('onDisconnect');
    console.log(r);
  };
  onEmit = r  => {
    console.log('onEmit');
    console.log(r);
  };
  onTyping = resp => {
    console.log('onTyping');
    console.log(resp);
  };

  onUserDisconnected = resp => {
    console.log('onUserDisconnected');
    console.log(resp);
  };
  onRecvEvent = resp => {
    console.log('onRecvEvent');
    console.log(resp);
  };

 // on unload 
 componentWillUnmount() {
    this.state.socket.off("typing", this.onTyping);
    this.state.socket.off("chat message", this.onChatMessage);
    this.state.socket.off("new user", this.onNewUser);
    this.state.socket.off("user disconnected", this.onUserDisconnected);
  }

 fSubmit =(e)=>{
  e.preventDefault();
  console.log('test');

   let datas = this.state.datas;
   let name = this.refs.name.value;
   let address = this.refs.address.value;
  console.log('name :'+name);
  console.log('address :'+address);

  let data  = {
    name, 
    address
  }



  datas.push(data);

  this.setState({
    datas : datas
  });

  this.refs.myForm1.reset();
  this.refs.name.focus();


 }

  //set username
  fSetUserName =(e)=>{
    this.refs.myForm1.hide();

  }



  render(){
    let datas = this.state.datas;
    let response = this.state.response;
    const {users, messages}= this.state;
      console.log(users);
    return (
      <div className="App">
        <h2>{this.state.title}</h2>
        <div className="userDiv">
          <b>Online:</b>
          {users.map((user,i)=>
            <p><small key={i}>{user}</small></p>
          )}
        </div>
        <div className="msgDiv">
          <b>Messages:</b>
          {messages.map((msg,i)=>
            <p><small key={i}>{msg.nick}</small>: {msg.message}</p>
          )}
        </div>




        <form ref="myForm1" className="myForm1">
          <input type="text" ref="name" placeholder="your name" className="formfield"/>
          <button onClick={this.fSubmit} className="myButton">Submit</button>
        </form>


        <form ref="myForm1" className="myForm1">
          <input type="text" ref="name" placeholder="your name" className="formfield"/>
          <input type="text" ref="address" placeholder="your address" className="formfield"/>
          <button onClick={this.fSubmit} className="myButton">Submit</button>
        </form>
        <pre>
          {datas.map((data,i)=>
             <li key={i} className="myList">
              {i+1}. {data.name}, {data.address}
              <button onClick={()=>this.fRemove(i)} className="myButton">remove</button>
              <button onClick={()=>this.fEdit(i)} className="myButton">edit</button>
             </li>
            )}
        </pre>


      </div>
    );
  }
}

export default App;
