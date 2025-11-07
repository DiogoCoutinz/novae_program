import { motion } from 'framer-motion';

const Header = ({ comercialName, comercialInitials }) => {
  return (
    <motion.div
      className="mb-8 md:mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">
          Welcome back, {comercialName}!
        </h1>
      </div>
      <p className="text-gray-400 text-lg">Here's your latest performance insights.</p>
    </motion.div>
  );
};

export default Header;

