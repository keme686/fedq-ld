package fr.inria.wimmics.query.dqp.server;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;

import fr.inria.wimmics.common.utils.LoggerLocal;

public class FedQLDServer {
	private static Logger log = LoggerLocal.getLogger(FedQLDServer.class.getName());
	//private static ServerEnvironment env;
	
	
	public static void configureStaticResources(List<Handler> hList) {
		ResourceHandler resource_handler = new ResourceHandler();
		resource_handler.setDirectoriesListed(true);
		resource_handler.setWelcomeFiles(new String[] { "index.html" });
		resource_handler.setResourceBase("./static/");
		ContextHandler staticContextHandler = new ContextHandler();
		staticContextHandler.setContextPath("/");
		staticContextHandler.setHandler(resource_handler);
		hList.add(staticContextHandler);

	}
	public static void configureServlets(List<Handler> hList) {
		//env = ServerEnvironment.getInstance();
		
		//env.getDqpEnvironment().addEndpoint("http://localhost:3030/books/query");
		//env.getDqpEnvironment().addEndpoint("http://localhost:3031/persons/query");		
		
		ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
		context.setContextPath("/dqp");
		
		//context.setAttribute("name", object);
		//context.addServlet(org.eclipse.jetty.servlet.DefaultServlet.class, "/");
		
		//context.addServlet(new ServletHolder(new QueryServlet()), "/sparql");
		//context.addServlet(new ServletHolder(new AddEndpointServlet()), "/addEndpoint");
		context.addServlet(QueryServlet.class, "/sparql");
		context.addServlet(AddEndpointServlet.class, "/addEndpoint");
		context.addServlet(GetEndpointListServlet.class, "/getEndpoints");
		context.addServlet(RemoveEndpointServlet.class, "/removeEndpoint");
		context.addServlet(ExplainResultServlet.class, "/explainResult");
		
		
		hList.add(context);

	}

	public static void main(String[] args) throws Exception {
		Server server = new Server(8080);
		
		List<Handler> hList = new ArrayList<Handler>();
		configureStaticResources(hList);
		configureServlets(hList);

		HandlerList handlers = new HandlerList();
		hList.add(new DefaultHandler());
		//handlers.setHandlers(new Handler[] { resource_handler, new DefaultHandler() });
		handlers.setHandlers(hList.toArray(new Handler[hList.size()]));
		server.setHandler(handlers);
		server.start();
		log.info("Server started");
		server.join();
	}
}
