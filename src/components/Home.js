import React, {Component} from 'react';
import Tab from './Tab'
class Home extends Component {
	render(){
		return this.props.pages.map((page) =>(
			<Tab  key={page.id} page={page}/>
		));
	}
	
}

export default Home;
