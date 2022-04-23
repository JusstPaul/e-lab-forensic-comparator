import Auth from '@/Layouts/Auth'

const NoClass = () => (
  <Auth role="student" title="Unregistered Class">
    <div className="w-full h-full flex justify-center">
      <div className="mt-28">
        <div className="px-2 py-4 md:px-16 md:py-12 text-center bg-dark border-dark shadow-sm rounded">
          <div>
            <p className="text-xl font-semibold">
              Not Yet Registered to a Class
            </p>
            <p className="font-light">
              Please contact your instructor to add you to a class
            </p>
          </div>
        </div>
      </div>
    </div>
  </Auth>
)

export default NoClass
