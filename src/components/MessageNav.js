import React, {Component} from 'react';

class MessageNav extends Component {
	render(){
		return (
  			<nav className="main-header navbar navbar-expand">
		        <ul className="navbar-nav ml-auto">
		          <li className="nav-item dropdown">
			        <a className="nav-link" data-toggle="dropdown" href="#">
			          <i className="far fa-comments"></i>
			          <span className="badge badge-danger navbar-badge">3</span>
			        </a>

        			<div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">

			          <a href="#" class="dropdown-item">
			            <div class="media">
			              <div class="media-body">
			                <h3 class="dropdown-item-title">
			                  <span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>
			                </h3>
			                <p class="text-sm">Call me whenever you can...</p>
			                <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
			              </div>
			            </div>
			          </a>

        			</div>
		          </li>
		        </ul>
	        </nav>
		);
	}
	
}

export default MessageNav;
