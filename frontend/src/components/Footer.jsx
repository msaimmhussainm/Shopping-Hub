import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Shopping-Hub. Made by MSaimMHussainM</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Professional E-Commerce Solution</p>
            </div>
        </footer>
    );
};

export default Footer;
