import { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { signUp, verifyCode } from '../../api/endpoints/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const callSignUp = async (signUpData) => {
    setLoading(true);
    try {
      const response = await signUp(signUpData);
      if (response.status === 200) {
        toast.success('Verification code sent to your email.');
        setEmail(signUpData.email);
        setIsVerificationStep(true);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Sign Up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const callVerifyCode = async (verificationData) => {
    setLoading(true);
    try {
      const response = await verifyCode(verificationData);
      if (response.status === 201) {
        toast.success('Verification successful. You are now registered!');
        navigate('/logIn');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',  // حقل رقم الهاتف الجديد
    verificationCode: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(50, 'Must be 50 characters or less')
      .required('Required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
    phoneNumber: Yup.number()
      .typeError('Phone number must be a number')
      .required('Required'),  // التحقق من رقم الهاتف
  });

  const verificationSchema = Yup.object({
    verificationCode: Yup.string()
      .length(6, 'Code must be 6 digits')
      .required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!isVerificationStep) {
      await callSignUp(values);
    } else {
      await callVerifyCode({ email, code: values.verificationCode });
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={!isVerificationStep ? validationSchema : verificationSchema}
      onSubmit={handleSubmit}
    >
      {({ getFieldProps, isSubmitting }) => (
        <Form className="flex flex-col gap-4 mb-20">
          {!isVerificationStep ? (
            <>
              {/* نموذج إدخال بيانات المستخدم */}
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...getFieldProps('name')}
                  className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...getFieldProps('email')}
                  className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block mb-2 font-medium">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  {...getFieldProps('phoneNumber')}
                  className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
                />
                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block mb-2 font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...getFieldProps('password')}
                    className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 font-medium">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...getFieldProps('confirmPassword')}
                    className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* نموذج إدخال كود التحقق */}
              <div>
                <label htmlFor="verificationCode" className="block mb-2 font-medium">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  {...getFieldProps('verificationCode')}
                  className="w-full min-h-12 p-3 pl-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-base-color"
                />
                <ErrorMessage name="verificationCode" component="div" className="text-red-500 text-sm mt-1" />
                <p className="text-lg font-semibold text-base-color mt-4">Check Your Email</p>
              </div>
            </>
          )}

          <div className="flex justify-between text-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting || loading} // تعطيل الزر أثناء التحميل
              className={`w-full py-3 font-semibold rounded-md transition-all duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-base-color text-white hover:bg-second-color'
                }`}
            >
              {loading ? 'Loading...' : isVerificationStep ? 'Verify Code' : 'Sign Up'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignUpForm;
