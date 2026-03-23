import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="w-full py-8 mt-auto flex flex-col items-center justify-center gap-4 bg-admin-surface border-t border-admin-outline-variant/10">
      <div className="flex gap-6">
        <a className="font-['Inter'] text-xs tracking-[0.05rem] text-admin-on-surface-variant/60 hover:text-admin-primary transition-opacity opacity-80 hover:opacity-100 uppercase" href="#">Privacy Policy</a>
        <a className="font-['Inter'] text-xs tracking-[0.05rem] text-admin-on-surface-variant/60 hover:text-admin-primary transition-opacity opacity-80 hover:opacity-100 uppercase" href="#">System Status</a>
        <a className="font-['Inter'] text-xs tracking-[0.05rem] text-admin-on-surface-variant/60 hover:text-admin-primary transition-opacity opacity-80 hover:opacity-100 uppercase" href="#">API Docs</a>
      </div>
      <p className="font-['Inter'] text-xs tracking-[0.05rem] text-center text-admin-on-surface-variant opacity-80 uppercase">© {new Date().getFullYear()} RANKLEN Ethereal Command. All rights reserved.</p>
    </footer>
  );
};

export default AdminFooter;
