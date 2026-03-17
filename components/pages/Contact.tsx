import React, { useState } from 'react';
import { Phone, Mail, ArrowRight } from 'lucide-react';

export const ContactPage = () => {
   const [formData, setFormData] = useState({ name: '', email: '', message: '', subject: 'Feature Suggestion' });

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const { name, email, message, subject } = formData;

      try {
         const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message, subject }),
         });

         if (response.ok) {
            alert('Message sent successfully!');
            setFormData({ name: '', email: '', message: '', subject: 'Feature Suggestion' });
         } else {
            alert('Failed to send message. Please try again later.');
         }
      } catch (error) {
         console.error('Error sending message:', error);
         alert('An error occurred. Please try again later.');
      }
   };

   return (
      <div className="max-w-6xl mx-auto px-4 py-32 animate-fade-in">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <h1 className="text-5xl font-bold font-display text-slate-900 dark:text-white mb-8 tracking-tight">Get in touch</h1>
               <p className="text-slate-500 dark:text-slate-400 mb-12 leading-relaxed text-xl font-light">
                  Have a question or feedback? We'd love to hear from you. Fill out the form or reach out directly via WhatsApp.
               </p>

               <div className="space-y-8">
                  <div className="flex items-center gap-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-[1.02] hover:border-brand-200 group">
                     <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Phone size={32} />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">WhatsApp Support</p>
                        <p className="font-bold text-slate-900 dark:text-white text-xl">+92 313 3258330</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-[1.02] hover:border-brand-200 group">
                     <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Mail size={32} />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Email Us</p>
                        <p className="font-bold text-slate-900 dark:text-white text-xl">muneebrashidhome@gmail.com</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden transform hover:translate-y-[-5px] transition-transform duration-500">
               <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"></div>
               <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 relative z-10">Send us a message</h3>
               <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Name</label>
                     <input
                        required
                        type="text"
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/50 transition-all dark:text-white focus:bg-white dark:focus:bg-slate-900"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email</label>
                     <input
                        required
                        type="email"
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/50 transition-all dark:text-white focus:bg-white dark:focus:bg-slate-900"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Subject / Category</label>
                     <select
                        required
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/50 transition-all dark:text-white focus:bg-white dark:focus:bg-slate-900 appearance-none"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                     >
                        <option value="Feature Suggestion">Suggest a New Tool / Feature</option>
                        <option value="Bug Report">Problem or Bug Report</option>
                        <option value="Payment Issue">Payment / Subscription Issue</option>
                        <option value="Other">General Inquiry / Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Message</label>
                     <textarea
                        required
                        rows={4}
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/50 transition-all dark:text-white resize-none focus:bg-white dark:focus:bg-slate-900"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                     ></textarea>
                  </div>
                  <button type="submit" className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 group">
                     Send Message <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </form>
            </div>
         </div>
      </div>
   );
};